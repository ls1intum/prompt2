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

func CreateCompetency(ctx context.Context, req competencyDTO.CreateCompetencyRequest) error {
	tx, err := CompetencyServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)
	qtx := CompetencyServiceSingleton.queries.WithTx(tx)

	err = qtx.CreateCompetency(ctx, db.CreateCompetencyParams{
		ID:           uuid.New(),
		CategoryID:   req.CategoryID,
		Name:         req.Name,
		Description:  pgtype.Text{String: req.Description, Valid: true},
		Novice:       req.Novice,
		Intermediate: req.Intermediate,
		Advanced:     req.Advanced,
		Expert:       req.Expert,
		Weight:       req.Weight,
	})
	if err != nil {
		log.Error("could not create competency: ", err)
		return errors.New("could not create competency")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit competency creation: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func GetCompetency(ctx context.Context, id uuid.UUID) (db.Competency, error) {
	competency, err := CompetencyServiceSingleton.queries.GetCompetency(ctx, id)
	if err != nil {
		log.Error("could not get competency: ", err)
		return db.Competency{}, errors.New("could not get competency")
	}
	return competency, nil
}

func ListCompetencies(ctx context.Context) ([]db.Competency, error) {
	competencies, err := CompetencyServiceSingleton.queries.ListCompetencies(ctx)
	if err != nil {
		log.Error("could not list competencies: ", err)
		return nil, errors.New("could not list competencies")
	}
	return competencies, nil
}

func ListCompetenciesByCategory(ctx context.Context, categoryID uuid.UUID) ([]db.Competency, error) {
	competencies, err := CompetencyServiceSingleton.queries.ListCompetenciesByCategory(ctx, categoryID)
	if err != nil {
		log.Error("could not list competencies by category: ", err)
		return nil, errors.New("could not list competencies by category")
	}
	return competencies, nil
}

func UpdateCompetency(ctx context.Context, id uuid.UUID, req competencyDTO.UpdateCompetencyRequest) error {
	err := CompetencyServiceSingleton.queries.UpdateCompetency(ctx, db.UpdateCompetencyParams{
		ID:           id,
		CategoryID:   req.CategoryID,
		Name:         req.Name,
		Description:  pgtype.Text{String: req.Description, Valid: true},
		Novice:       req.Novice,
		Intermediate: req.Intermediate,
		Advanced:     req.Advanced,
		Expert:       req.Expert,
		Weight:       req.Weight,
	})
	if err != nil {
		log.Error("could not update competency: ", err)
		return errors.New("could not update competency")
	}
	return nil
}

func DeleteCompetency(ctx context.Context, id uuid.UUID) error {
	err := CompetencyServiceSingleton.queries.DeleteCompetency(ctx, id)
	if err != nil {
		log.Error("could not delete competency: ", err)
		return errors.New("could not delete competency")
	}
	return nil
}
