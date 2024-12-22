package applicationAdministration

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type ApplicationServiceSingleton struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ApplicationService *ApplicationServiceSingleton

// TODO
func GetApplicationForm(ctx context.Context, coursePhaseID uuid.UUID) (applicationDTO.Form, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	isApplicationPhase, err := ApplicationService.queries.CheckIfCoursePhaseIsApplicationPhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, err
	}

	if !isApplicationPhase {
		return applicationDTO.Form{}, errors.New("course phase is not an application phase")
	}

	applicationQuestionsText, err := ApplicationService.queries.GetApplicationQuestionsTextForCoursePhase(ctxWithTimeout, coursePhaseID)
	if err != nil {
		return applicationDTO.Form{}, err
	}

	applicationQuestionsMultiSelect, err := ApplicationService.queries.GetApplicationQuestionsMultiSelectForCoursePhase(ctxWithTimeout, coursePhaseID)

	applicationFormDTO := applicationDTO.GetFormDTOFromDBModel(applicationQuestionsText, applicationQuestionsMultiSelect)

	return applicationFormDTO, nil
}

func UpdateApplicationForm() {

}

// TODO
func GetApplication() {

}
