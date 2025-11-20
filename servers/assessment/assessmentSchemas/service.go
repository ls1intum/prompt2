package assessmentSchemas

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentSchemas/assessmentSchemaDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type AssessmentSchemaService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentSchemaServiceSingleton *AssessmentSchemaService

func CreateAssessmentSchema(ctx context.Context, req assessmentSchemaDTO.CreateAssessmentSchemaRequest) (assessmentSchemaDTO.AssessmentSchema, error) {
	tx, err := AssessmentSchemaServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return assessmentSchemaDTO.AssessmentSchema{}, err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentSchemaServiceSingleton.queries.WithTx(tx)

	schemaID := uuid.New()

	var description pgtype.Text
	if req.Description != "" {
		description = pgtype.Text{String: req.Description, Valid: true}
	}

	err = qtx.CreateAssessmentSchema(ctx, db.CreateAssessmentSchemaParams{
		ID:          schemaID,
		Name:        req.Name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("Failed to create assessment schema")
		return assessmentSchemaDTO.AssessmentSchema{}, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return assessmentSchemaDTO.AssessmentSchema{}, err
	}

	// Fetch the created schema
	schema, err := GetAssessmentSchema(ctx, schemaID)
	if err != nil {
		return assessmentSchemaDTO.AssessmentSchema{}, err
	}

	return schema, nil
}

func GetAssessmentSchema(ctx context.Context, schemaID uuid.UUID) (assessmentSchemaDTO.AssessmentSchema, error) {
	schema, err := AssessmentSchemaServiceSingleton.queries.GetAssessmentSchema(ctx, schemaID)
	if err != nil {
		log.WithError(err).Error("Failed to get assessment schema")
		return assessmentSchemaDTO.AssessmentSchema{}, err
	}

	return assessmentSchemaDTO.MapDBAssessmentSchemaToDTOAssessmentSchema(schema), nil
}

func ListAssessmentSchemas(ctx context.Context) ([]assessmentSchemaDTO.AssessmentSchema, error) {
	schemas, err := AssessmentSchemaServiceSingleton.queries.ListAssessmentSchemas(ctx)
	if err != nil {
		log.WithError(err).Error("Failed to list assessment schemas")
		return nil, err
	}

	result := make([]assessmentSchemaDTO.AssessmentSchema, len(schemas))
	for i, schema := range schemas {
		result[i] = assessmentSchemaDTO.MapDBAssessmentSchemaToDTOAssessmentSchema(schema)
	}

	return result, nil
}

func UpdateAssessmentSchema(ctx context.Context, schemaID uuid.UUID, req assessmentSchemaDTO.UpdateAssessmentSchemaRequest) error {
	// First check if schema exists
	_, err := GetAssessmentSchema(ctx, schemaID)
	if err != nil {
		return err
	}

	tx, err := AssessmentSchemaServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentSchemaServiceSingleton.queries.WithTx(tx)

	var description pgtype.Text
	if req.Description != "" {
		description = pgtype.Text{String: req.Description, Valid: true}
	}

	err = qtx.UpdateAssessmentSchema(ctx, db.UpdateAssessmentSchemaParams{
		ID:          schemaID,
		Name:        req.Name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("Failed to update assessment schema")
		return err
	}

	return tx.Commit(ctx)
}

func DeleteAssessmentSchema(ctx context.Context, schemaID uuid.UUID) error {
	tx, err := AssessmentSchemaServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentSchemaServiceSingleton.queries.WithTx(tx)

	err = qtx.DeleteAssessmentSchema(ctx, schemaID)
	if err != nil {
		log.WithError(err).Error("Failed to delete assessment schema")
		return err
	}

	return tx.Commit(ctx)
}

func GetCoursePhasesByAssessmentSchema(ctx context.Context, assessmentSchemaID uuid.UUID) ([]uuid.UUID, error) {
	coursePhaseIDs, err := AssessmentSchemaServiceSingleton.queries.GetCoursePhasesByAssessmentSchema(ctx, assessmentSchemaID)
	if err != nil {
		log.WithError(err).Error("Failed to get course phases by assessment schema")
		return nil, err
	}

	return coursePhaseIDs, nil
}
