package applicationAdministration

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type ApplicationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ApplicationServiceSingleton *ApplicationService

// TODO
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
		return err
	}

	if !isApplicationPhase {
		return errors.New("course phase is not an application phase")
	}

	// Delete all questions to be deleted
	for _, questionID := range form.DeleteQuestionsMultiSelect {
		err := ApplicationServiceSingleton.queries.DeleteApplicationQuestionMultiSelect(ctx, questionID)
		if err != nil {
			return errors.New("could not delete question")
		}
	}

	for _, questionID := range form.DeleteQuestionsText {
		err := ApplicationServiceSingleton.queries.DeleteApplicationQuestionText(ctx, questionID)
		if err != nil {
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
			return errors.New("could not create question")
		}
	}

	// Update the rest
	for _, question := range form.UpdateQuestionsMultiSelect {
		questionDBModel := question.GetDBModel()
		err = ApplicationServiceSingleton.queries.UpdateApplicationQuestionMultiSelect(ctx, questionDBModel)
		if err != nil {
			return errors.New("could not update question")
		}
	}

	for _, question := range form.UpdateQuestionsText {
		questionDBModel := question.GetDBModel()
		err = ApplicationServiceSingleton.queries.UpdateApplicationQuestionText(ctx, questionDBModel)
		if err != nil {
			return errors.New("could not update question")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil

}

// TODO
func GetApplication() {

}
