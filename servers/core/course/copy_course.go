package course

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/utils"
	log "github.com/sirupsen/logrus"
)

func copyCourseInternal(ctx context.Context, sourceCourseID uuid.UUID, courseVariables courseDTO.CopyCourse, requesterID string) (courseDTO.Course, error) {
	sourceCourse, err := CourseServiceSingleton.queries.GetCourse(ctx, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to fetch source course: %w", err)
	}

	restrictedData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.RestrictedData)
	if err != nil {
		return courseDTO.Course{}, err
	}
	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.StudentReadableData)
	if err != nil {
		return courseDTO.Course{}, err
	}

	newCourse := courseDTO.CreateCourse{
		Name:                courseVariables.Name,
		StartDate:           sourceCourse.StartDate,
		EndDate:             sourceCourse.EndDate,
		SemesterTag:         courseVariables.SemesterTag,
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		CourseType:          sourceCourse.CourseType,
		Ects:                sourceCourse.Ects,
	}

	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return courseDTO.Course{}, err
	}
	defer utils.DeferRollback(tx, ctx)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	createCourseParams, err := newCourse.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, err
	}
	createCourseParams.ID = uuid.New()

	createdCourse, err := qtx.CreateCourse(ctx, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, err
	}

	phaseIDMap, err := copyCoursePhases(ctx, qtx, sourceCourseID, createdCourse.ID)
	if err != nil {
		return courseDTO.Course{}, err
	}

	err = copyCoursePhaseGraph(ctx, qtx, sourceCourseID, createdCourse.ID, phaseIDMap)
	if err != nil {
		return courseDTO.Course{}, err
	}

	err = setInitialPhase(ctx, qtx, sourceCourseID, createdCourse.ID, phaseIDMap)
	if err != nil {
		return courseDTO.Course{}, err
	}

	dtoIDMap, err := copyDTOs(ctx, qtx, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, err
	}

	err = copyMetaGraphs(ctx, qtx, sourceCourseID, createdCourse.ID, phaseIDMap, dtoIDMap)
	if err != nil {
		return courseDTO.Course{}, err
	}

	err = CourseServiceSingleton.createCourseGroupsAndRoles(ctx, createdCourse.Name, createdCourse.SemesterTag.String, requesterID)
	if err != nil {
		log.Error("Failed to create keycloak roles for course: ", err)
		return courseDTO.Course{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return courseDTO.GetCourseDTOFromDBModel(createdCourse)
}

func copyCoursePhases(ctx context.Context, qtx *db.Queries, sourceID, targetID uuid.UUID) (map[uuid.UUID]uuid.UUID, error) {
	sequence, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(ctx, sourceID)
	if err != nil {
		return nil, err
	}
	unordered, err := CourseServiceSingleton.queries.GetNotOrderedCoursePhases(ctx, sourceID)
	if err != nil {
		return nil, err
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
		phase, err := coursePhase.GetCoursePhaseByID(ctx, oldID)
		if err != nil {
			return nil, err
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
			return nil, err
		}
		dbModel.ID = uuid.New()
		if _, err := qtx.CreateCoursePhase(ctx, dbModel); err != nil {
			return nil, err
		}
		mapping[oldID] = dbModel.ID
	}
	return mapping, nil
}

func copyCoursePhaseGraph(ctx context.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap map[uuid.UUID]uuid.UUID) error {
	graph, err := CourseServiceSingleton.queries.GetCoursePhaseGraph(ctx, sourceID)
	if err != nil {
		return err
	}
	for _, item := range graph {
		fromID, ok1 := phaseMap[item.FromCoursePhaseID]
		toID, ok2 := phaseMap[item.ToCoursePhaseID]
		if !ok1 || !ok2 {
			return fmt.Errorf("missing phase mapping for graph edge")
		}
		if err := qtx.CreateCourseGraphConnection(ctx, db.CreateCourseGraphConnectionParams{
			FromCoursePhaseID: fromID,
			ToCoursePhaseID:   toID,
		}); err != nil {
			return err
		}
	}
	return nil
}

func setInitialPhase(ctx context.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap map[uuid.UUID]uuid.UUID) error {
	sequence, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(ctx, sourceID)
	if err != nil {
		return err
	}
	for _, p := range sequence {
		if p.IsInitialPhase {
			if err := qtx.UpdateInitialCoursePhase(ctx, db.UpdateInitialCoursePhaseParams{
				CourseID: targetID,
				ID:       phaseMap[p.ID],
			}); err != nil {
				return err
			}
			break
		}
	}
	return nil
}

func copyDTOs(ctx context.Context, qtx *db.Queries, sourceID uuid.UUID) (map[uuid.UUID]uuid.UUID, error) {
	unordered, err := CourseServiceSingleton.queries.GetNotOrderedCoursePhases(ctx, sourceID)
	if err != nil {
		return nil, err
	}
	sequence, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(ctx, sourceID)
	if err != nil {
		return nil, err
	}

	// Collect all unique CoursePhaseTypeIDs
	uniqueTypes := make(map[uuid.UUID]struct{})
	for _, p := range unordered {
		uniqueTypes[p.CoursePhaseTypeID] = struct{}{}
	}
	for _, p := range sequence {
		uniqueTypes[p.CoursePhaseTypeID] = struct{}{}
	}

	dtoIDMap := make(map[uuid.UUID]uuid.UUID)

	for tID := range uniqueTypes {
		outputs, err := qtx.GetCoursePhaseProvidedParticipationOutputs(ctx, tID)
		if err != nil {
			return nil, err
		}
		for _, o := range outputs {
			dtoIDMap[o.ID] = o.ID
		}

		// Get inputs
		inputs, err := qtx.GetCoursePhaseRequiredParticipationInputs(ctx, tID)
		if err != nil {
			return nil, err
		}
		for _, i := range inputs {
			dtoIDMap[i.ID] = i.ID
		}
	}

	return dtoIDMap, nil
}

func copyMetaGraphs(ctx context.Context, qtx *db.Queries, sourceID, targetID uuid.UUID, phaseMap, dtoMap map[uuid.UUID]uuid.UUID) error {
	// Phase Data Graph
	phaseGraph, err := CourseServiceSingleton.queries.GetPhaseDataGraph(ctx, sourceID)
	if err != nil {
		return err
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
	if err := UpdatePhaseDataGraphHelper(ctx, qtx, targetID, converted); err != nil {
		return err
	}

	// Participation Data Graph
	participationGraph, err := CourseServiceSingleton.queries.GetParticipationDataGraph(ctx, sourceID)
	if err != nil {
		return err
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

	return UpdateParticipationDataGraphHelper(ctx, qtx, targetID, converted)
}

func UpdateParticipationDataGraphHelper(ctx context.Context, qtx *db.Queries, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	// delete all previous connections
	err := qtx.DeleteParticipationDataGraphConnections(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate {
		err = qtx.CreateParticipationDataConnection(ctx, db.CreateParticipationDataConnectionParams{
			FromCoursePhaseID:    graphItem.FromCoursePhaseID,
			ToCoursePhaseID:      graphItem.ToCoursePhaseID,
			FromCoursePhaseDtoID: graphItem.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   graphItem.ToCoursePhaseDtoID,
		})
		if err != nil {
			log.Error("Error creating graph connection: ", err)
			return err
		}
	}
	return nil

}

func UpdatePhaseDataGraphHelper(ctx context.Context, qtx *db.Queries, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	// delete all previous connections
	err := qtx.DeletePhaseDataGraphConnections(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate {
		err = qtx.CreatePhaseDataConnection(ctx, db.CreatePhaseDataConnectionParams{
			FromCoursePhaseID:    graphItem.FromCoursePhaseID,
			ToCoursePhaseID:      graphItem.ToCoursePhaseID,
			FromCoursePhaseDtoID: graphItem.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   graphItem.ToCoursePhaseDtoID,
		})
		if err != nil {
			log.Error("Error creating graph connection: ", err)
			return err
		}
	}
	return nil

}
