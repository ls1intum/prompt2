package applicationAdministration

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/course/courseParticipation"
	"github.com/niclasheun/prompt2.0/course/courseParticipation/courseParticipationDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/student"
	log "github.com/sirupsen/logrus"
)

type ApplicationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ApplicationServiceSingleton *ApplicationService

var ErrNotFound = errors.New("application was not found")
var ErrAlreadyApplied = errors.New("application already exists")
var ErrStudentDetailsDoNotMatch = errors.New("student details do not match")

func GetApplicationForm(ctx context.Context, coursePhaseID uuid.UUID) (applicationDTO.Form, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	isApplicationPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, err
	}

	if !isApplicationPhase {
		return applicationDTO.Form{}, errors.New("course phase is not an application phase")
	}

	applicationQuestionsText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, err
	}

	applicationQuestionsMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, err
	}

	applicationFormDTO := applicationDTO.GetFormDTOFromDBModel(applicationQuestionsText, applicationQuestionsMultiSelect)

	return applicationFormDTO, nil
}

func UpdateApplicationForm(ctx context.Context, coursePhaseId uuid.UUID, form applicationDTO.UpdateForm) error {
	tx, err := ApplicationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Check if course phase is application phase
	isApplicationPhase, err := ApplicationServiceSingleton.queries.CheckIfCoursePhaseIsApplicationPhase(ctx, coursePhaseId)
	if err != nil {
		log.Error(err)
		return err
	}

	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	// Delete all questions to be deleted
	for _, questionID := range form.DeleteQuestionsMultiSelect {
		err := ApplicationServiceSingleton.queries.DeleteApplicationQuestionMultiSelect(ctx, questionID)
		if err != nil {
			log.Error(err)
			return errors.New("could not delete question")
		}
	}

	for _, questionID := range form.DeleteQuestionsText {
		err := ApplicationServiceSingleton.queries.DeleteApplicationQuestionText(ctx, questionID)
		if err != nil {
			log.Error(err)
			return errors.New("could not delete question")
		}
	}

	// Create all questions to be created
	for _, question := range form.CreateQuestionsText {
		questionDBModel := question.GetDBModel()
		questionDBModel.ID = uuid.New()
		// force ensuring right course phase id -> but also checked in validation
		questionDBModel.CoursePhaseID = coursePhaseId

		err = ApplicationServiceSingleton.queries.CreateApplicationQuestionText(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not create question")
		}
	}

	for _, question := range form.CreateQuestionsMultiSelect {
		questionDBModel := question.GetDBModel()
		questionDBModel.ID = uuid.New()
		// force ensuring right course phase id -> but also checked in validation
		questionDBModel.CoursePhaseID = coursePhaseId

		err = ApplicationServiceSingleton.queries.CreateApplicationQuestionMultiSelect(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not create question")
		}
	}

	// Update the rest
	for _, question := range form.UpdateQuestionsMultiSelect {
		questionDBModel := question.GetDBModel()
		err = ApplicationServiceSingleton.queries.UpdateApplicationQuestionMultiSelect(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not update question")
		}
	}

	for _, question := range form.UpdateQuestionsText {
		questionDBModel := question.GetDBModel()
		err = ApplicationServiceSingleton.queries.UpdateApplicationQuestionText(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not update question")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil

}

func GetOpenApplicationPhases(ctx context.Context) ([]applicationDTO.OpenApplication, error) {
	applicationCoursePhases, err := ApplicationServiceSingleton.queries.GetAllOpenApplicationPhases(ctx)
	if err != nil {
		log.Error(err)
		return nil, errors.New("could not get open application phases")
	}

	openApplications := make([]applicationDTO.OpenApplication, 0, len(applicationCoursePhases))
	for _, openApplication := range applicationCoursePhases {
		applicationPhase := applicationDTO.GetOpenApplicationPhaseDTO(openApplication)
		openApplications = append(openApplications, applicationPhase)
	}

	return openApplications, nil
}

func GetApplicationFormWithDetails(ctx context.Context, coursePhaseID uuid.UUID) (applicationDTO.FormWithDetails, error) {
	applicationCoursePhase, err := ApplicationServiceSingleton.queries.GetOpenApplicationPhase(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return applicationDTO.FormWithDetails{}, ErrNotFound
	}

	applicationFormText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return applicationDTO.FormWithDetails{}, errors.New("could not get application form")
	}

	applicationFormMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return applicationDTO.FormWithDetails{}, errors.New("could not get application form")
	}

	openApplicationDTO := applicationDTO.GetFormWithDetailsDTOFromDBModel(applicationCoursePhase, applicationFormText, applicationFormMultiSelect)

	return openApplicationDTO, nil
}

func PostApplicationExtern(ctx context.Context, coursePhaseID uuid.UUID, application applicationDTO.PostApplication) error {
	tx, err := ApplicationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Check if studentObj with this email already exists
	studentObj, err := student.GetStudentByEmail(ctx, application.Student.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Error(err)
		return errors.New("could save the application")
	}

	// this means that a student with this email exists
	if err == nil {
		// check if student details are the same
		if studentObj.FirstName != application.Student.FirstName || studentObj.LastName != application.Student.LastName {
			return ErrStudentDetailsDoNotMatch
		}

		// check if student already applied -> External students are not allowed to apply twice
		exists, err := ApplicationServiceSingleton.queries.GetApplicationExistsForStudent(ctx, db.GetApplicationExistsForStudentParams{StudentID: studentObj.ID, ID: coursePhaseID})
		if err != nil {
			log.Error(err)
			return errors.New("could not get existing student")
		}
		if exists {
			return ErrAlreadyApplied
		}
	} else {
		// create student
		studentObj, err = student.CreateStudent(ctx, application.Student)
		if err != nil {
			log.Error(err)
			return errors.New("could not save student")
		}
	}

	// 2. Create Course and Course Phase Participation
	courseID, err := ApplicationServiceSingleton.queries.GetCourseIDByCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not find the application")
	}

	cParticipation, err := courseParticipation.CreateCourseParticipation(ctx, courseParticipationDTO.CreateCourseParticipation{StudentID: studentObj.ID, CourseID: courseID})
	if err != nil {
		log.Error(err)
		return errors.New("could not create course participation")
	}

	cPhaseParticipation, err := coursePhaseParticipation.CreateCoursePhaseParticipation(ctx, coursePhaseParticipationDTO.CreateCoursePhaseParticipation{CourseParticipationID: cParticipation.ID, CoursePhaseID: coursePhaseID})
	if err != nil {
		log.Error(err)
		return errors.New("could not create course phase participation")
	}

	// 3. Save answers
	for _, answer := range application.AnswersText {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = ApplicationServiceSingleton.queries.CreateApplicationAnswerText(ctx, answerDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could save the application answers")
		}
	}

	for _, answer := range application.AnswersMultiSelect {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = ApplicationServiceSingleton.queries.CreateApplicationAnswerMultiSelect(ctx, answerDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could save the application answers")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func GetApplicationAuthenticatedByEmail(ctx context.Context, email string, coursePhaseID uuid.UUID) (applicationDTO.Application, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	studentObj, err := student.GetStudentByEmail(ctxWithTimeout, email)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		return applicationDTO.Application{
			Status:             applicationDTO.StatusNewUser,
			Student:            nil,
			AnswersText:        make([]applicationDTO.AnswerText, 0),
			AnswersMultiSelect: make([]applicationDTO.AnswerMultiSelect, 0),
		}, nil
	}
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get the student")
	}

	exists, err := ApplicationServiceSingleton.queries.GetApplicationExistsForStudent(ctxWithTimeout, db.GetApplicationExistsForStudentParams{StudentID: studentObj.ID, ID: coursePhaseID})
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get application details")
	}

	if exists {
		answersText, err := ApplicationServiceSingleton.queries.GetApplicationAnswersTextForStudent(ctxWithTimeout, db.GetApplicationAnswersTextForStudentParams{StudentID: studentObj.ID, CoursePhaseID: coursePhaseID})
		if err != nil {
			log.Error(err)
			return applicationDTO.Application{}, errors.New("could not get application answers")
		}

		answersMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationAnswersMultiSelectForStudent(ctxWithTimeout, db.GetApplicationAnswersMultiSelectForStudentParams{StudentID: studentObj.ID, CoursePhaseID: coursePhaseID})
		if err != nil {
			log.Error(err)
			return applicationDTO.Application{}, errors.New("could not get application answers")
		}
		return applicationDTO.Application{
			Status:             applicationDTO.StatusApplied,
			Student:            &studentObj,
			AnswersText:        applicationDTO.GetAnswersTextDTOFromDBModels(answersText),
			AnswersMultiSelect: applicationDTO.GetAnswersMultiSelectDTOFromDBModels(answersMultiSelect),
		}, nil

	} else {
		return applicationDTO.Application{
			Status:             applicationDTO.StatusNotApplied,
			Student:            &studentObj,
			AnswersText:        make([]applicationDTO.AnswerText, 0),
			AnswersMultiSelect: make([]applicationDTO.AnswerMultiSelect, 0),
		}, nil
	}

}

func PostApplicationAuthenticatedStudent(ctx context.Context, coursePhaseID uuid.UUID, application applicationDTO.PostApplication) error {
	tx, err := ApplicationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Update student details
	studentObj, err := student.CreateOrUpdateStudent(ctx, application.Student)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the student")
	}

	// 2. Possibly Create Course and Course Phase Participation
	courseID, err := ApplicationServiceSingleton.queries.GetCourseIDByCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not get the application phase")
	}

	cParticipation, err := courseParticipation.CreateIfNotExistingCourseParticipation(ctx, studentObj.ID, courseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the course participation")
	}

	cPhaseParticipation, err := coursePhaseParticipation.CreateIfNotExistingPhaseParticipation(ctx, cParticipation.ID, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the course phase participation")
	}

	// 3. Save answers
	for _, answer := range application.AnswersText {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = ApplicationServiceSingleton.queries.CreateOrOverwriteApplicationAnswerText(ctx, db.CreateOrOverwriteApplicationAnswerTextParams(answerDBModel))
		if err != nil {
			log.Error(err)
			return errors.New("could not save the application answers")
		}

	}

	for _, answer := range application.AnswersMultiSelect {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = ApplicationServiceSingleton.queries.CreateOrOverwriteApplicationAnswerMultiSelect(ctx, db.CreateOrOverwriteApplicationAnswerMultiSelectParams(answerDBModel))
		if err != nil {
			log.Error(err)
			return errors.New("could not save the application answers")
		}

	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil

}

func GetApplicationByCPPID(ctx context.Context, coursePhaseID uuid.UUID, coursePhaseParticipationID uuid.UUID) (applicationDTO.Application, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	applicationExists, err := ApplicationServiceSingleton.queries.GetApplicationExists(ctxWithTimeout, db.GetApplicationExistsParams{CoursePhaseID: coursePhaseID, ID: coursePhaseParticipationID})
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get application")
	}

	if !applicationExists {
		return applicationDTO.Application{}, ErrNotFound
	}

	studentObj, err := student.GetStudentByCoursePhaseParticipationID(ctxWithTimeout, coursePhaseParticipationID)
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get student")
	}

	answersText, err := ApplicationServiceSingleton.queries.GetApplicationAnswersTextForStudent(ctxWithTimeout, db.GetApplicationAnswersTextForStudentParams{StudentID: studentObj.ID, CoursePhaseID: coursePhaseID})
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get application answers")
	}

	answersMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationAnswersMultiSelectForStudent(ctxWithTimeout, db.GetApplicationAnswersMultiSelectForStudentParams{StudentID: studentObj.ID, CoursePhaseID: coursePhaseID})
	if err != nil {
		log.Error(err)
		return applicationDTO.Application{}, errors.New("could not get application answers")
	}

	return applicationDTO.Application{
		Status:             applicationDTO.StatusApplied,
		Student:            &studentObj,
		AnswersText:        applicationDTO.GetAnswersTextDTOFromDBModels(answersText),
		AnswersMultiSelect: applicationDTO.GetAnswersMultiSelectDTOFromDBModels(answersMultiSelect),
	}, nil
}

func GetAllApplicationParticipations(ctx context.Context, coursePhaseID uuid.UUID) ([]applicationDTO.ApplicationParticipation, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	applicationParticipations, err := ApplicationServiceSingleton.queries.GetAllApplicationParticipations(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error(err)
		return nil, errors.New("could not get application participations")
	}

	applicationParticipationsDTO := make([]applicationDTO.ApplicationParticipation, 0, len(applicationParticipations))
	for _, applicationParticipation := range applicationParticipations {
		application, err := applicationDTO.GetAllCPPsForCoursePhaseDTOFromDBModel(applicationParticipation)
		if err != nil {
			log.Error(err)
			return nil, errors.New("could not get application participations")
		}
		applicationParticipationsDTO = append(applicationParticipationsDTO, application)
	}

	return applicationParticipationsDTO, nil
}

func UpdateApplicationAssessment(ctx context.Context, coursePhaseID uuid.UUID, coursePhaseParticipationID uuid.UUID, assessment applicationDTO.PutAssessment) error {
	tx, err := ApplicationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := ApplicationServiceSingleton.queries.WithTx(tx)

	if assessment.PassStatus != nil || assessment.MetaData.Length() > 0 {
		var passStatus db.NullPassStatus
		if assessment.PassStatus != nil {
			passStatus = db.NullPassStatus{
				Valid:      true,
				PassStatus: *assessment.PassStatus,
			}
		} else {
			passStatus = db.NullPassStatus{
				Valid:      false,
				PassStatus: "",
			}
		}

		// TODO: implement transaction control here
		err := coursePhaseParticipation.UpdateCoursePhaseParticipation(ctx, coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
			ID:         coursePhaseParticipationID,
			PassStatus: passStatus,
			MetaData:   assessment.MetaData,
		})
		if err != nil {
			log.Error(err)
			return errors.New("could not update application assessment")
		}
	}

	if assessment.Score.Valid {
		err := qtx.UpdateApplicationAssessment(ctx, db.UpdateApplicationAssessmentParams{CoursePhaseParticipationID: coursePhaseParticipationID, Score: assessment.Score})
		if err != nil {
			log.Error(err)
			return errors.New("could not update application assessment")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func UploadAdditionalScore(ctx context.Context, coursePhaseID uuid.UUID, additionalScore applicationDTO.AdditionalScore) error {
	tx, err := ApplicationServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}

	defer tx.Rollback(ctx)
	qtx := ApplicationServiceSingleton.queries.WithTx(tx)

	// generate batch of scores
	batchScores := make([]float64, 0, len(additionalScore.Scores))
	coursePhaseIDs := make([]uuid.UUID, 0, len(additionalScore.Scores))

	for _, score := range additionalScore.Scores {
		log.Info(score)
		batchScores = append(batchScores, float64(score.Score))
		coursePhaseIDs = append(coursePhaseIDs, uuid.MustParse(score.CoursePhaseParticipationID))
	}
	scoreNameArray := make([]string, 0, 1)
	scoreNameArray = append(scoreNameArray, additionalScore.Name)

	err = qtx.BatchUpdateAdditionalScores(ctx, db.BatchUpdateAdditionalScoresParams{
		Column1:       coursePhaseIDs,
		Column2:       batchScores,
		Column3:       scoreNameArray,
		CoursePhaseID: coursePhaseID,
	})
	if err != nil {
		log.Error(err)
		return errors.New("could not update additional scores")
	}

	// set under threshold to failed

	// add score to the course phase meta data
	_, err = qtx.GetExistingAdditionalScores(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not update additional scores")
	}

	coursePhaseDTO, err := coursePhase.GetCoursePhaseByID(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not update additional scores")
	}

	metaDataUpdate, err := addScoreName(coursePhaseDTO.MetaData, additionalScore.Name)
	if err != nil {
		return err
	}

	err = qtx.UpdateExistingAdditionalScores(ctx, db.UpdateExistingAdditionalScoresParams{
		ID:       coursePhaseID,
		MetaData: metaDataUpdate,
	})
	if err != nil {
		log.Error(err)
		return errors.New("could not update additional scores")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func GetAdditionalScores(ctx context.Context, coursePhaseID uuid.UUID) ([]string, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	coursePhaseDTO, err := coursePhase.GetCoursePhaseByID(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error(err)
		return nil, errors.New("could not update additional scores")
	}

	return metaToScoresArray(coursePhaseDTO.MetaData)
}

func metaToScoresArray(metaData meta.MetaData) ([]string, error) {
	var scoreNamesArray []string

	oldNames, ok := metaData["additionalScores"]
	if ok && oldNames != nil {
		// Assert that oldNames is a slice of interface{}
		oldNamesArray, ok := oldNames.([]interface{})
		if !ok {
			log.Error("expected []interface{}, got: ", oldNames)
			return nil, errors.New("could not update additional scores")
		}

		// Convert each element to string
		for _, name := range oldNamesArray {
			nameStr, ok := name.(string)
			if !ok {
				log.Error("expected string, got: ", name)
				return nil, errors.New("could not update additional scores")
			}
			scoreNamesArray = append(scoreNamesArray, nameStr)
		}
	}

	return scoreNamesArray, nil
}

func addScoreName(oldMetaData meta.MetaData, newName string) ([]byte, error) {
	var newScoreNamesArray []string

	newScoreNamesArray, err := metaToScoresArray(oldMetaData)
	if err != nil {
		return nil, err
	}

	nameExists := false
	for _, name := range newScoreNamesArray {
		if name == newName {
			nameExists = true
			break
		}
	}

	if !nameExists {
		newScoreNamesArray = append(newScoreNamesArray, newName)
	}

	metaDataUpdate := meta.MetaData{
		"additionalScores": newScoreNamesArray,
	}

	byteArray, err := metaDataUpdate.GetDBModel()
	if err != nil {
		log.Error(err)
		return nil, errors.New("could not update additional scores")
	}

	return byteArray, nil
}
