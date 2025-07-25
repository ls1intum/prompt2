package categories

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/categories/categoryDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CategoryService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CategoryServiceSingleton *CategoryService

func CreateCategory(ctx context.Context, coursePhaseID uuid.UUID, req categoryDTO.CreateCategoryRequest) error {
	tx, err := CategoryServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CategoryServiceSingleton.queries.WithTx(tx)

	err = qtx.CreateCategory(ctx, db.CreateCategoryParams{
		ID:                   uuid.New(),
		Name:                 req.Name,
		ShortName:            pgtype.Text{String: req.ShortName, Valid: true},
		Description:          pgtype.Text{String: req.Description, Valid: true},
		Weight:               req.Weight,
		AssessmentTemplateID: req.AssessmentTemplateID,
	})
	if err != nil {
		log.Error("could not create category: ", err)
		return errors.New("could not create category")
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func GetCategory(ctx context.Context, id uuid.UUID) (db.Category, error) {
	category, err := CategoryServiceSingleton.queries.GetCategory(ctx, id)
	if err != nil {
		log.Error("could not get category: ", err)
		return db.Category{}, errors.New("could not get category")
	}
	return category, nil
}

func ListCategories(ctx context.Context) ([]db.Category, error) {
	categories, err := CategoryServiceSingleton.queries.ListCategories(ctx)
	if err != nil {
		log.Error("could not list categories: ", err)
		return nil, errors.New("could not list categories")
	}
	return categories, nil
}

func UpdateCategory(ctx context.Context, id uuid.UUID, coursePhaseID uuid.UUID, req categoryDTO.UpdateCategoryRequest) error {
	err := CategoryServiceSingleton.queries.UpdateCategory(ctx, db.UpdateCategoryParams{
		ID:                   id,
		Name:                 req.Name,
		ShortName:            pgtype.Text{String: req.ShortName, Valid: true},
		Description:          pgtype.Text{String: req.Description, Valid: true},
		Weight:               req.Weight,
		AssessmentTemplateID: req.AssessmentTemplateID,
	})
	if err != nil {
		log.Error("could not update category: ", err)
		return errors.New("could not update category")
	}
	return nil
}

func DeleteCategory(ctx context.Context, id uuid.UUID) error {
	err := CategoryServiceSingleton.queries.DeleteCategory(ctx, id)
	if err != nil {
		log.Error("could not delete category: ", err)
		return errors.New("could not delete category")
	}
	return nil
}

func GetCategoriesWithCompetencies(ctx context.Context, assessmentTemplateID uuid.UUID) ([]categoryDTO.CategoryWithCompetencies, error) {
	dbRows, err := CategoryServiceSingleton.queries.GetCategoriesWithCompetencies(ctx, assessmentTemplateID)
	if err != nil {
		log.Error("could not get categories with competencies: ", err)
		return nil, errors.New("could not get categories with competencies")
	}
	return categoryDTO.MapToCategoryWithCompetenciesDTO(dbRows), nil
}
