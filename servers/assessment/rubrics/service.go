package rubrics

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/rubrics/rubricDTO"
	log "github.com/sirupsen/logrus"
)

type RubricService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var RubricServiceSingleton *RubricService

func GetRubricsForCompetency(ctx context.Context, competencyID uuid.UUID) ([]rubricDTO.Rubric, error) {
	rubrics, err := RubricServiceSingleton.queries.GetRubricsForCompetency(ctx, competencyID)
	if err != nil {
		log.Error("could not get rubrics: ", err)
		return nil, errors.New("failed to retrieve rubrics")
	}
	return rubricDTO.GetRubricDTOsFromDBModels(rubrics), nil
}

func CreateRubric(ctx context.Context, request rubricDTO.CreateRubricRequest) error {
	tx, err := RubricServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Error("could not begin transaction: ", err)
		return errors.New("failed to start transaction")
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	err = RubricServiceSingleton.queries.WithTx(tx).InsertRubric(ctx, db.InsertRubricParams{
		ID:           uuid.New(),
		CompetencyID: request.CompetencyID,
		Level:        request.Level,
		Description:  request.Description,
	})
	if err != nil {
		log.Error("could not create rubric: ", err)
		return errors.New("failed to insert rubric")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit transaction: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func UpdateRubric(ctx context.Context, rubricID uuid.UUID, request rubricDTO.UpdateRubricRequest) error {
	err := RubricServiceSingleton.queries.UpdateRubric(ctx, db.UpdateRubricParams{
		ID:          rubricID,
		Level:       request.Level,
		Description: request.Description,
	})
	if err != nil {
		log.Error("could not update rubric: ", err)
		return errors.New("failed to update rubric")
	}
	return nil
}

func DeleteRubric(ctx context.Context, rubricID uuid.UUID) error {
	err := RubricServiceSingleton.queries.DeleteRubric(ctx, rubricID)
	if err != nil {
		log.Error("could not delete rubric: ", err)
		return errors.New("failed to delete rubric")
	}
	return nil
}
