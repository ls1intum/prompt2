package competencies

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CompetencyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CompetencyServiceSingleton *CompetencyService

func GetRootCompetencies(ctx context.Context) ([]competencyDTO.Competency, error) {
	rows, err := CompetencyServiceSingleton.queries.GetRootCompetencies(ctx)
	if err != nil {
		log.Error("could not fetch root competencies: ", err)
		return nil, errors.New("failed to get root competencies")
	}
	return competencyDTO.GetCompetencyDTOsFromDBModels(rows), nil
}

func GetSubCompetencies(ctx context.Context, superCompetencyID uuid.UUID) ([]competencyDTO.Competency, error) {
	rows, err := CompetencyServiceSingleton.queries.GetSubCompetencies(ctx, superCompetencyID)
	if err != nil {
		log.Error("could not fetch sub-competencies: ", err)
		return nil, errors.New("failed to get sub-competencies")
	}
	return competencyDTO.GetCompetencyDTOsFromDBModels(rows), nil
}

func CreateCompetency(ctx context.Context, name, description string, superCompetencyID *uuid.UUID) error {
	tx, err := CompetencyServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Error("could not begin transaction: ", err)
		return errors.New("failed to start transaction")
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CompetencyServiceSingleton.queries.WithTx(tx)
	id := uuid.New()
	params := db.InsertCompetencyParams{
		ID:                id,
		Name:              name,
		Description:       pgtype.Text{String: description, Valid: true},
		SuperCompetencyID: *superCompetencyID,
	}

	err = qtx.InsertCompetency(ctx, params)
	if err != nil {
		log.Error("could not insert competency: ", err)
		return errors.New("failed to create competency")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit transaction: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func UpdateCompetency(ctx context.Context, id uuid.UUID, name, description string, superCompetencyID *uuid.UUID) error {
	err := CompetencyServiceSingleton.queries.UpdateCompetency(ctx, db.UpdateCompetencyParams{
		ID:                id,
		Name:              name,
		Description:       pgtype.Text{String: description, Valid: true},
		SuperCompetencyID: *superCompetencyID,
	})
	if err != nil {
		log.Error("could not update competency: ", err)
		return errors.New("failed to update competency")
	}
	return nil
}

func DeleteCompetency(ctx context.Context, id uuid.UUID) error {
	err := CompetencyServiceSingleton.queries.DeleteCompetency(ctx, id)
	if err != nil {
		log.Error("could not delete competency: ", err)
		return errors.New("failed to delete competency")
	}
	return nil
}
