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
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
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
	qtx := ApplicationServiceSingleton.queries.WithTx(tx)

	// Check if course phase is application phase
	isApplicationPhase, err := qtx.CheckIfCoursePhaseIsApplicationPhase(ctx, coursePhaseId)
	if err != nil {
		log.Error(err)
		return err
	}

	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	// Delete all questions to be deleted
	for _, questionID := range form.DeleteQuestionsMultiSelect {
		err := qtx.DeleteApplicationQuestionMultiSelect(ctx, questionID)
		if err != nil {
			log.Error(err)
			return errors.New("could not delete question")
		}
	}

	for _, questionID := range form.DeleteQuestionsText {
		err := qtx.DeleteApplicationQuestionText(ctx, questionID)
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

		err = qtx.CreateApplicationQuestionText(ctx, questionDBModel)
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

		err = qtx.CreateApplicationQuestionMultiSelect(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not create question")
		}
	}

	// Update the rest
	for _, question := range form.UpdateQuestionsMultiSelect {
		questionDBModel := question.GetDBModel()
		err = qtx.UpdateApplicationQuestionMultiSelect(ctx, questionDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could not update question")
		}
	}

	for _, question := range form.UpdateQuestionsText {
		questionDBModel := question.GetDBModel()
		err = qtx.UpdateApplicationQuestionText(ctx, questionDBModel)
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
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()
	applicationCoursePhase, err := ApplicationServiceSingleton.queries.GetOpenApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error(err)
		return applicationDTO.FormWithDetails{}, ErrNotFound
	}

	applicationFormText, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.Error(err)
		return applicationDTO.FormWithDetails{}, errors.New("could not get application form")
	}

	applicationFormMultiSelect, err := ApplicationServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctxWithTimeout, coursePhaseID)
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
	qtx := ApplicationServiceSingleton.queries.WithTx(tx)

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
		exists, err := qtx.GetApplicationExistsForStudent(ctx, db.GetApplicationExistsForStudentParams{StudentID: studentObj.ID, ID: coursePhaseID})
		if err != nil {
			log.Error(err)
			return errors.New("could not get existing student")
		}
		if exists {
			return ErrAlreadyApplied
		}
	} else {
		// create student
		// FIX THIS!!!!
		studentObj, err = student.CreateStudent(ctx, qtx, application.Student)
		if err != nil {
			log.Error(err)
			return errors.New("could not save student")
		}
	}

	// 2. Create Course and Course Phase Participation
	courseID, err := qtx.GetCourseIDByCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not find the application")
	}

	cParticipation, err := courseParticipation.CreateCourseParticipation(ctx, qtx, courseParticipationDTO.CreateCourseParticipation{StudentID: studentObj.ID, CourseID: courseID})
	if err != nil {
		log.Error(err)
		return errors.New("could not create course participation")
	}

	cPhaseParticipation, err := coursePhaseParticipation.CreateCoursePhaseParticipation(ctx, qtx, coursePhaseParticipationDTO.CreateCoursePhaseParticipation{CourseParticipationID: cParticipation.ID, CoursePhaseID: coursePhaseID})
	if err != nil {
		log.Error(err)
		return errors.New("could not create course phase participation")
	}

	// 3. Save answers
	for _, answer := range application.AnswersText {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = qtx.CreateApplicationAnswerText(ctx, answerDBModel)
		if err != nil {
			log.Error(err)
			return errors.New("could save the application answers")
		}
	}

	for _, answer := range application.AnswersMultiSelect {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = qtx.CreateApplicationAnswerMultiSelect(ctx, answerDBModel)
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
	qtx := ApplicationServiceSingleton.queries.WithTx(tx)

	// 1. Update student details
	studentObj, err := student.CreateOrUpdateStudent(ctx, qtx, application.Student)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the student")
	}

	// 2. Possibly Create Course and Course Phase Participation
	courseID, err := qtx.GetCourseIDByCoursePhaseID(ctx, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not get the application phase")
	}

	cParticipation, err := courseParticipation.CreateIfNotExistingCourseParticipation(ctx, qtx, studentObj.ID, courseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the course participation")
	}

	cPhaseParticipation, err := coursePhaseParticipation.CreateIfNotExistingPhaseParticipation(ctx, qtx, cParticipation.ID, coursePhaseID)
	if err != nil {
		log.Error(err)
		return errors.New("could not save the course phase participation")
	}

	// 3. Save answers
	for _, answer := range application.AnswersText {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = qtx.CreateOrOverwriteApplicationAnswerText(ctx, db.CreateOrOverwriteApplicationAnswerTextParams(answerDBModel))
		if err != nil {
			log.Error(err)
			return errors.New("could not save the application answers")
		}

	}

	for _, answer := range application.AnswersMultiSelect {
		answerDBModel := answer.GetDBModel()
		answerDBModel.ID = uuid.New()
		answerDBModel.CoursePhaseParticipationID = cPhaseParticipation.ID
		err = qtx.CreateOrOverwriteApplicationAnswerMultiSelect(ctx, db.CreateOrOverwriteApplicationAnswerMultiSelectParams(answerDBModel))
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
