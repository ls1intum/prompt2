package course

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	"github.com/ls1intum/prompt2/servers/core/applicationAdministration/applicationDTO"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	"github.com/ls1intum/prompt2/servers/core/coursePhase"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseDTO"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	"github.com/ls1intum/prompt2/servers/core/utils"
	log "github.com/sirupsen/logrus"
)

// checkAllCoursePhasesCopyable checks if all course phases from the source course can be copied to the target course.
func checkAllCoursePhasesCopyable(c *gin.Context, sourceCourseID uuid.UUID) ([]string, error) {
	sequence, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(c, sourceCourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase sequence: %w", err)
	}
	unordered, err := CourseServiceSingleton.queries.GetNotOrderedCoursePhases(c, sourceCourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get unordered course phases: %w", err)
	}

	// Track seen base URLs to avoid duplicate requests
	checked := make(map[string]string) // baseUrl => phaseTypeName (for reporting)
	missing := []string{}

	for _, p := range sequence {
		pt, err := CourseServiceSingleton.queries.GetCoursePhaseTypeByID(c, p.CoursePhaseTypeID)
		if err != nil {
			return nil, fmt.Errorf("failed to get phase type: %w", err)
		}

		// Skip internal/core phases
		if pt.BaseUrl == utils.GetEnv("CORE_HOST", "core") {
			continue
		}

		if _, seen := checked[pt.BaseUrl]; seen {
			continue
		}

		resp, err := sendRequest("OPTIONS", c.GetHeader("Authorization"), nil, pt.BaseUrl+"/copy")
		if err != nil {
			log.Warnf("Error checking copy endpoint for phase '%s': %v", pt.Name, err)
			missing = append(missing, pt.Name)
			checked[pt.BaseUrl] = pt.Name
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusNotFound {
			missing = append(missing, pt.Name)
		}
		checked[pt.BaseUrl] = pt.Name
	}

	for _, p := range unordered {
		pt, err := CourseServiceSingleton.queries.GetCoursePhaseTypeByID(c, p.CoursePhaseTypeID)
		if err != nil {
			return nil, fmt.Errorf("failed to get phase type: %w", err)
		}

		// Skip internal/core phases
		if pt.BaseUrl == utils.GetEnv("CORE_HOST", "core") {
			continue
		}

		if _, seen := checked[pt.BaseUrl]; seen {
			continue
		}

		resp, err := sendRequest("OPTIONS", c.GetHeader("Authorization"), nil, pt.BaseUrl+"/copy")
		if err != nil {
			log.Warnf("Error checking copy endpoint for phase '%s': %v", pt.Name, err)
			missing = append(missing, pt.Name)
			checked[pt.BaseUrl] = pt.Name
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusNotFound {
			missing = append(missing, pt.Name)
		}
		checked[pt.BaseUrl] = pt.Name
	}

	return missing, nil
}

// copyCourseInternal creates a deep copy of the given course.
// It copies phases, metadata, DTO mappings, graphs, and the application form if present.
// It also creates course-specific Keycloak roles and groups.
// The function runs within a database transaction.
func copyCourseInternal(c *gin.Context, sourceCourseID uuid.UUID, courseVariables courseDTO.CopyCourseRequest, requesterID string) (courseDTO.Course, error) {
	sourceCourse, err := CourseServiceSingleton.queries.GetCourse(c, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to fetch source course: %w", err)
	}

	restrictedData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.RestrictedData)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert restricted data: %w", err)
	}
	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.StudentReadableData)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert student readable data: %w", err)
	}

	newCourse := courseDTO.CreateCourse{
		Name:                courseVariables.Name,
		StartDate:           courseVariables.StartDate,
		EndDate:             courseVariables.EndDate,
		SemesterTag:         courseVariables.SemesterTag,
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		CourseType:          sourceCourse.CourseType,
		Ects:                sourceCourse.Ects,
	}

	tx, err := CourseServiceSingleton.conn.Begin(c)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer utils.DeferRollback(tx, c)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	createCourseParams, err := newCourse.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert course to DB model: %w", err)
	}
	createCourseParams.ID = uuid.New()

	createdCourse, err := qtx.CreateCourse(c, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to create course in DB: %w", err)
	}

	phaseIDMap, err := copyCoursePhases(c, qtx, sourceCourseID, createdCourse.ID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy course phases: %w", err)
	}

	if err := copyCoursePhaseGraph(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy course phase graph: %w", err)
	}

	if err := setInitialPhase(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to set initial phase: %w", err)
	}

	dtoIDMap, err := copyDTOs(c, qtx, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy DTOs: %w", err)
	}

	if err := copyMetaGraphs(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap, dtoIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy meta graphs: %w", err)
	}

	sourceApplicationPhaseID, err := getApplicationPhaseID(c, qtx, sourceCourseID)
	if err != nil && err != pgx.ErrNoRows {
		return courseDTO.Course{}, fmt.Errorf("failed to get source application phase ID: %w", err)
	}

	targetApplicationPhaseID, err := getApplicationPhaseID(c, qtx, createdCourse.ID)
	if err != nil && err != pgx.ErrNoRows {
		return courseDTO.Course{}, fmt.Errorf("failed to get target application phase ID: %w", err)
	}

	if sourceApplicationPhaseID != uuid.Nil && targetApplicationPhaseID != uuid.Nil {
		if err := copyApplicationForm(c, qtx, sourceApplicationPhaseID, targetApplicationPhaseID); err != nil {
			return courseDTO.Course{}, fmt.Errorf("failed to copy application form: %w", err)
		}
	}

	if err := copyPhaseConfigurations(c, qtx, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy phase configurations: %w", err)
	}

	if err := CourseServiceSingleton.createCourseGroupsAndRoles(c, createdCourse.Name, createdCourse.SemesterTag.String, requesterID); err != nil {
		log.Error("failed to create keycloak roles for course: ", err)
		return courseDTO.Course{}, fmt.Errorf("failed to create keycloak roles/groups: %w", err)
	}

	if err := tx.Commit(c); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to commit course transaction: %w", err)
	}

	return courseDTO.GetCourseDTOFromDBModel(createdCourse)
}

// copyCoursePhases duplicates all phases from the source course to the target course.
// It returns a mapping of old phase IDs to new phase IDs.
func copyCoursePhases(c *gin.Context, qtx *db.Queries, sourceID, targetID uuid.UUID) (map[uuid.UUID]uuid.UUID, error) {
	sequence, err := qtx.GetCoursePhaseSequence(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase sequence: %w", err)
	}
	unordered, err := qtx.GetNotOrderedCoursePhases(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get unordered course phases: %w", err)
	}

	allPhases := make(map[uuid.UUID]struct{})
	for _, p := range sequence {
		allPhases[p.ID] = struct{}{}
	}
	for _, p := range unordered {
		allPhases[p.ID] = struct{}{}
	}

	mapping := make(map[uuid.UUID]uuid.UUID)
	for oldID := range allPhases {
		phase, err := coursePhase.GetCoursePhaseByID(c, oldID)
		if err != nil {
			return nil, fmt.Errorf("failed to get course phase by ID %s: %w", oldID, err)
		}

		newPhase := coursePhaseDTO.CreateCoursePhase{
			Name:                phase.Name,
			IsInitialPhase:      phase.IsInitialPhase,
			CourseID:            targetID,
			CoursePhaseTypeID:   phase.CoursePhaseTypeID,
			RestrictedData:      phase.RestrictedData,
			StudentReadableData: phase.StudentReadableData,
		}
		dbModel, err := newPhase.GetDBModel()
		if err != nil {
			return nil, fmt.Errorf("failed to convert phase to DB model: %w", err)
		}
		dbModel.ID = uuid.New()
		if _, err := qtx.CreateCoursePhase(c, dbModel); err != nil {
			return nil, fmt.Errorf("failed to create course phase: %w", err)
		}
		mapping[oldID] = dbModel.ID
	}
	return mapping, nil
}

// copyCoursePhaseGraph replicates the course phase dependency graph from the source course
// to the target course using the provided phase ID mapping.
func copyCoursePhaseGraph(c *gin.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap map[uuid.UUID]uuid.UUID) error {
	graph, err := qtx.GetCoursePhaseGraph(c, sourceID)
	if err != nil {
		return fmt.Errorf("failed to get course phase graph: %w", err)
	}
	for _, item := range graph {
		fromID, ok1 := phaseMap[item.FromCoursePhaseID]
		toID, ok2 := phaseMap[item.ToCoursePhaseID]
		if !ok1 || !ok2 {
			return fmt.Errorf("missing phase mapping for graph edge from %s to %s", item.FromCoursePhaseID, item.ToCoursePhaseID)
		}
		if err := qtx.CreateCourseGraphConnection(c, db.CreateCourseGraphConnectionParams{
			FromCoursePhaseID: fromID,
			ToCoursePhaseID:   toID,
		}); err != nil {
			return fmt.Errorf("failed to create course graph connection: %w", err)
		}
	}
	return nil
}

// setInitialPhase sets the initial course phase in the target course by mapping
// the initial phase from the source course via the provided phase ID mapping.
func setInitialPhase(c *gin.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap map[uuid.UUID]uuid.UUID) error {
	sequence, err := qtx.GetCoursePhaseSequence(c, sourceID)
	if err != nil {
		return fmt.Errorf("failed to get phase sequence: %w", err)
	}
	for _, p := range sequence {
		if p.IsInitialPhase {
			if err := qtx.UpdateInitialCoursePhase(c, db.UpdateInitialCoursePhaseParams{
				CourseID: targetID,
				ID:       phaseMap[p.ID],
			}); err != nil {
				return fmt.Errorf("failed to set initial phase: %w", err)
			}
			break
		}
	}
	return nil
}

// copyDTOs collects all participation DTOs (inputs and outputs) used by the source course phases.
// It returns a map from source DTO IDs to themselves, to support mapping-based operations.
func copyDTOs(c *gin.Context, qtx *db.Queries, sourceID uuid.UUID) (map[uuid.UUID]uuid.UUID, error) {
	dtoIDMap := make(map[uuid.UUID]uuid.UUID)

	// Collect all DTOs from course phase types
	unordered, err := qtx.GetNotOrderedCoursePhases(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get unordered course phases: %w", err)
	}
	sequence, err := qtx.GetCoursePhaseSequence(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase sequence: %w", err)
	}

	// Collect all unique CoursePhaseTypeIDs
	uniqueTypes := make(map[uuid.UUID]struct{})
	for _, p := range unordered {
		uniqueTypes[p.CoursePhaseTypeID] = struct{}{}
	}
	for _, p := range sequence {
		uniqueTypes[p.CoursePhaseTypeID] = struct{}{}
	}
	for tID := range uniqueTypes {
		outputs, err := qtx.GetCoursePhaseProvidedParticipationOutputs(c, tID)
		if err != nil {
			return nil, fmt.Errorf("failed to get participation outputs for type %s: %w", tID, err)
		}
		for _, o := range outputs {
			dtoIDMap[o.ID] = o.ID
		}

		// Get inputs
		inputs, err := qtx.GetCoursePhaseRequiredParticipationInputs(c, tID)
		if err != nil {
			return nil, fmt.Errorf("failed to get participation inputs for type %s: %w", tID, err)
		}
		for _, i := range inputs {
			dtoIDMap[i.ID] = i.ID
		}
	}

	// Collect all DTOs from graphs
	phaseGraph, err := qtx.GetPhaseDataGraph(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get phase data graph: %w", err)
	}
	for _, edge := range phaseGraph {
		dtoIDMap[edge.FromCoursePhaseDtoID] = edge.FromCoursePhaseDtoID
		dtoIDMap[edge.ToCoursePhaseDtoID] = edge.ToCoursePhaseDtoID
	}

	participationGraph, err := qtx.GetParticipationDataGraph(c, sourceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get participation data graph: %w", err)
	}
	for _, edge := range participationGraph {
		dtoIDMap[edge.FromCoursePhaseDtoID] = edge.FromCoursePhaseDtoID
		dtoIDMap[edge.ToCoursePhaseDtoID] = edge.ToCoursePhaseDtoID
	}

	return dtoIDMap, nil
}

// copyMetaGraphs recreates the phase and participation data graphs for the target course
// using the given mappings for phases and DTOs.
func copyMetaGraphs(c *gin.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap, dtoMap map[uuid.UUID]uuid.UUID) error {
	// Phase Data Graph
	phaseGraph, err := qtx.GetPhaseDataGraph(c, sourceID)
	if err != nil {
		return fmt.Errorf("failed to get phase data graph: %w", err)
	}
	converted := []courseDTO.MetaDataGraphItem{}
	for _, i := range phaseGraph {
		fromP, ok1 := phaseMap[i.FromCoursePhaseID]
		toP, ok2 := phaseMap[i.ToCoursePhaseID]
		fromD, ok3 := dtoMap[i.FromCoursePhaseDtoID]
		toD, ok4 := dtoMap[i.ToCoursePhaseDtoID]
		if !ok1 || !ok2 || !ok3 || !ok4 {
			return fmt.Errorf("invalid mapping in phase data graph")
		}
		converted = append(converted, courseDTO.MetaDataGraphItem{
			FromCoursePhaseID:    fromP,
			ToCoursePhaseID:      toP,
			FromCoursePhaseDtoID: fromD,
			ToCoursePhaseDtoID:   toD,
		})
	}
	if err := updatePhaseDataGraphHelper(c, qtx, targetID, converted); err != nil {
		return fmt.Errorf("failed to update phase data graph: %w", err)
	}

	// Participation Data Graph
	participationGraph, err := qtx.GetParticipationDataGraph(c, sourceID)
	if err != nil {
		return fmt.Errorf("failed to get participation data graph: %w", err)
	}
	converted = []courseDTO.MetaDataGraphItem{}
	for _, i := range participationGraph {
		fromP, ok1 := phaseMap[i.FromCoursePhaseID]
		toP, ok2 := phaseMap[i.ToCoursePhaseID]
		fromD, ok3 := dtoMap[i.FromCoursePhaseDtoID]
		toD, ok4 := dtoMap[i.ToCoursePhaseDtoID]
		if !ok1 || !ok2 || !ok3 || !ok4 {
			return fmt.Errorf("invalid mapping in participation data graph")
		}
		converted = append(converted, courseDTO.MetaDataGraphItem{
			FromCoursePhaseID:    fromP,
			ToCoursePhaseID:      toP,
			FromCoursePhaseDtoID: fromD,
			ToCoursePhaseDtoID:   toD,
		})
	}

	if err := updateParticipationDataGraphHelper(c, qtx, targetID, converted); err != nil {
		return fmt.Errorf("failed to update participation data graph: %w", err)
	}
	return nil
}

// copyApplicationForm copies the application form—including all questions—from
// the source course phase to the target course phase.
func copyApplicationForm(c *gin.Context, qtx *db.Queries, sourceCoursePhaseID, targetCoursePhaseID uuid.UUID) error {
	applicationForm, err := getApplicationFormHelper(c, qtx, sourceCoursePhaseID)
	if err != nil {
		return fmt.Errorf("failed to retrieve source application form: %w", err)
	}

	createQuestionsText := make([]applicationDTO.CreateQuestionText, 0, len(applicationForm.QuestionsText))
	for _, question := range applicationForm.QuestionsText {
		createQuestionsText = append(createQuestionsText, applicationDTO.CreateQuestionText{
			CoursePhaseID:            targetCoursePhaseID,
			Title:                    question.Title,
			Description:              question.Description,
			Placeholder:              question.Placeholder,
			ValidationRegex:          question.ValidationRegex,
			ErrorMessage:             question.ErrorMessage,
			IsRequired:               question.IsRequired,
			AllowedLength:            question.AllowedLength,
			OrderNum:                 question.OrderNum,
			AccessibleForOtherPhases: question.AccessibleForOtherPhases,
			AccessKey:                question.AccessKey,
		})
	}

	createQuestionsMultiSelect := make([]applicationDTO.CreateQuestionMultiSelect, 0, len(applicationForm.QuestionsMultiSelect))
	for _, question := range applicationForm.QuestionsMultiSelect {
		createQuestionsMultiSelect = append(createQuestionsMultiSelect, applicationDTO.CreateQuestionMultiSelect{
			CoursePhaseID:            targetCoursePhaseID,
			Title:                    question.Title,
			Description:              question.Description,
			Placeholder:              question.Placeholder,
			ErrorMessage:             question.ErrorMessage,
			IsRequired:               question.IsRequired,
			MinSelect:                question.MinSelect,
			MaxSelect:                question.MaxSelect,
			Options:                  question.Options,
			OrderNum:                 question.OrderNum,
			AccessibleForOtherPhases: question.AccessibleForOtherPhases,
			AccessKey:                question.AccessKey,
		})
	}

	form := applicationDTO.UpdateForm{
		DeleteQuestionsText:        []uuid.UUID{},
		DeleteQuestionsMultiSelect: []uuid.UUID{},
		CreateQuestionsText:        createQuestionsText,
		CreateQuestionsMultiSelect: createQuestionsMultiSelect,
		UpdateQuestionsText:        []applicationDTO.QuestionText{},
		UpdateQuestionsMultiSelect: []applicationDTO.QuestionMultiSelect{},
	}

	if err := updateApplicationFormHelper(c, qtx, targetCoursePhaseID, form); err != nil {
		return fmt.Errorf("failed to update application form: %w", err)
	}
	return nil
}

// copyPhaseConfigurations sends a request to the phase service to copy configurations
// for each phase that has a server-side implementation in the source course. It uses the phase ID mapping to ensure
// the correct phases are targeted.
func copyPhaseConfigurations(c *gin.Context, qtx *db.Queries, phaseIDMap map[uuid.UUID]uuid.UUID) error {
	for oldPhaseID, newPhaseID := range phaseIDMap {
		oldPhase, err := coursePhase.GetCoursePhaseByID(c, oldPhaseID)
		if err != nil {
			return fmt.Errorf("course phase with ID %s not found: %w", oldPhaseID, err)
		}

		oldPhaseType, err := qtx.GetCoursePhaseTypeByID(c, oldPhase.CoursePhaseTypeID)
		if err != nil {
			return fmt.Errorf("failed to fetch course phase type: %w", err)
		}

		baseURL := oldPhaseType.BaseUrl
		if baseURL == utils.GetEnv("CORE_HOST", "core") {
			continue
		}

		url := baseURL + "/copy"
		body, _ := json.Marshal(promptTypes.PhaseCopyRequest{
			SourceCoursePhaseID: oldPhaseID,
			TargetCoursePhaseID: newPhaseID,
		})

		resp, err := sendRequest("POST", c.GetHeader("Authorization"), bytes.NewBuffer(body), url)
		if err != nil {
			return fmt.Errorf("failed to send copy request to phase service: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			if resp.StatusCode == http.StatusNotFound {
				log.Warnf("Copy functionality not found for phase service '%s', skipping copy for this phase.", oldPhaseType.Name)
				continue
			}
			return fmt.Errorf("received non-OK response from phase service '%s': %s", oldPhaseType.Name, resp.Status)
		}
	}
	return nil
}

func sendRequest(method, authHeader string, body io.Reader, url string) (*http.Response, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		log.Error("Error creating request:", err)
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("Error sending request:", err)
		return nil, fmt.Errorf("failed to send HTTP request: %w", err)
	}

	return resp, nil
}

// updateApplicationFormHelper applies updates to a course phase's application form.
// It handles creation, deletion, and updating of text and multi-select questions.
func updateApplicationFormHelper(c *gin.Context, qtx *db.Queries, coursePhaseId uuid.UUID, form applicationDTO.UpdateForm) error {
	isApplicationPhase, err := qtx.CheckIfCoursePhaseIsApplicationPhase(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		return fmt.Errorf("failed to check if course phase is application phase: %w", err)
	}

	if !isApplicationPhase {
		return fmt.Errorf("course phase is not an application phase")
	}

	for _, questionID := range form.DeleteQuestionsMultiSelect {
		if err := qtx.DeleteApplicationQuestionMultiSelect(c, questionID); err != nil {
			log.Error(err)
			return fmt.Errorf("could not delete multi-select question: %w", err)
		}
	}
	for _, questionID := range form.DeleteQuestionsText {
		if err := qtx.DeleteApplicationQuestionText(c, questionID); err != nil {
			log.Error(err)
			return fmt.Errorf("could not delete text question: %w", err)
		}
	}

	for _, question := range form.CreateQuestionsText {
		model := question.GetDBModel()
		model.ID = uuid.New()
		model.CoursePhaseID = coursePhaseId
		if err := qtx.CreateApplicationQuestionText(c, model); err != nil {
			log.Error(err)
			return fmt.Errorf("could not create text question: %w", err)
		}
	}
	for _, question := range form.CreateQuestionsMultiSelect {
		model := question.GetDBModel()
		model.ID = uuid.New()
		model.CoursePhaseID = coursePhaseId
		if err := qtx.CreateApplicationQuestionMultiSelect(c, model); err != nil {
			log.Error(err)
			return fmt.Errorf("could not create multi-select question: %w", err)
		}
	}

	for _, question := range form.UpdateQuestionsMultiSelect {
		if err := qtx.UpdateApplicationQuestionMultiSelect(c, question.GetDBModel()); err != nil {
			log.Error(err)
			return fmt.Errorf("could not update multi-select question: %w", err)
		}
	}
	for _, question := range form.UpdateQuestionsText {
		if err := qtx.UpdateApplicationQuestionText(c, question.GetDBModel()); err != nil {
			log.Error(err)
			return fmt.Errorf("could not update text question: %w", err)
		}
	}

	return nil
}

// getApplicationFormHelper retrieves the application form for the given course phase,
// including all associated questions. Returns an error if the phase is not an application phase.
func getApplicationFormHelper(c *gin.Context, qtx *db.Queries, coursePhaseID uuid.UUID) (applicationDTO.Form, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(c)
	defer cancel()

	isApplicationPhase, err := qtx.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, fmt.Errorf("failed to check application phase: %w", err)
	}
	if !isApplicationPhase {
		return applicationDTO.Form{}, fmt.Errorf("course phase is not an application phase")
	}

	questionsText, err := qtx.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, fmt.Errorf("failed to get text questions: %w", err)
	}

	questionsMultiSelect, err := qtx.GetApplicationQuestionsMultiSelectForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, fmt.Errorf("failed to get multi-select questions: %w", err)
	}

	return applicationDTO.GetFormDTOFromDBModel(questionsText, questionsMultiSelect), nil
}

// updatePhaseDataGraphHelper deletes and recreates all phase data graph connections
// for the given course using the provided metadata graph items.
func updatePhaseDataGraphHelper(c *gin.Context, qtx *db.Queries, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	if err := qtx.DeletePhaseDataGraphConnections(c, courseID); err != nil {
		return fmt.Errorf("failed to delete old phase data graph connections: %w", err)
	}

	for _, item := range graphUpdate {
		err := qtx.CreatePhaseDataConnection(c, db.CreatePhaseDataConnectionParams{
			FromCoursePhaseID:    item.FromCoursePhaseID,
			ToCoursePhaseID:      item.ToCoursePhaseID,
			FromCoursePhaseDtoID: item.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   item.ToCoursePhaseDtoID,
		})
		if err != nil {
			log.Error("Error creating phase data connection: ", err)
			return fmt.Errorf("failed to create phase data connection: %w", err)
		}
	}
	return nil
}

// updateParticipationDataGraphHelper deletes and recreates all participation data graph connections
// for the given course using the provided metadata graph items.
func updateParticipationDataGraphHelper(c *gin.Context, qtx *db.Queries, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	if err := qtx.DeleteParticipationDataGraphConnections(c, courseID); err != nil {
		return fmt.Errorf("failed to delete old participation data graph connections: %w", err)
	}

	for _, item := range graphUpdate {
		err := qtx.CreateParticipationDataConnection(c, db.CreateParticipationDataConnectionParams{
			FromCoursePhaseID:    item.FromCoursePhaseID,
			ToCoursePhaseID:      item.ToCoursePhaseID,
			FromCoursePhaseDtoID: item.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   item.ToCoursePhaseDtoID,
		})
		if err != nil {
			log.Error("Error creating participation data connection: ", err)
			return fmt.Errorf("failed to create participation data connection: %w", err)
		}
	}
	return nil
}

// getApplicationPhaseID returns the ID of the application phase for the given course.
// If no application phase exists, it returns uuid.Nil and pgx.ErrNoRows.
func getApplicationPhaseID(c *gin.Context, qtx *db.Queries, courseID uuid.UUID) (uuid.UUID, error) {
	applicationPhaseID, err := qtx.GetApplicationPhaseIDForCourse(c, courseID)
	if err != nil {
		return uuid.Nil, err
	}
	return applicationPhaseID, nil
}
