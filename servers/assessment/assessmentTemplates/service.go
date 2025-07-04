package assessmentTemplates

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentTemplates/assessmentTemplateDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type AssessmentTemplateService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AssessmentTemplateServiceSingleton *AssessmentTemplateService

func CreateAssessmentTemplate(ctx context.Context, req assessmentTemplateDTO.CreateAssessmentTemplateRequest) (assessmentTemplateDTO.AssessmentTemplate, error) {
	tx, err := AssessmentTemplateServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return assessmentTemplateDTO.AssessmentTemplate{}, err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentTemplateServiceSingleton.queries.WithTx(tx)

	templateID := uuid.New()

	var description pgtype.Text
	if req.Description != "" {
		description = pgtype.Text{String: req.Description, Valid: true}
	}

	err = qtx.CreateAssessmentTemplate(ctx, db.CreateAssessmentTemplateParams{
		ID:          templateID,
		Name:        req.Name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("Failed to create assessment template")
		return assessmentTemplateDTO.AssessmentTemplate{}, err
	}

	err = tx.Commit(ctx)
	if err != nil {
		return assessmentTemplateDTO.AssessmentTemplate{}, err
	}

	// Fetch the created template
	template, err := GetAssessmentTemplate(ctx, templateID)
	if err != nil {
		return assessmentTemplateDTO.AssessmentTemplate{}, err
	}

	return template, nil
}

func GetAssessmentTemplate(ctx context.Context, templateID uuid.UUID) (assessmentTemplateDTO.AssessmentTemplate, error) {
	template, err := AssessmentTemplateServiceSingleton.queries.GetAssessmentTemplate(ctx, templateID)
	if err != nil {
		log.WithError(err).Error("Failed to get assessment template")
		return assessmentTemplateDTO.AssessmentTemplate{}, err
	}

	return assessmentTemplateDTO.MapDBAssessmentTemplateToDTOAssessmentTemplate(template), nil
}

func ListAssessmentTemplates(ctx context.Context) ([]assessmentTemplateDTO.AssessmentTemplate, error) {
	templates, err := AssessmentTemplateServiceSingleton.queries.ListAssessmentTemplates(ctx)
	if err != nil {
		log.WithError(err).Error("Failed to list assessment templates")
		return nil, err
	}

	result := make([]assessmentTemplateDTO.AssessmentTemplate, len(templates))
	for i, template := range templates {
		result[i] = assessmentTemplateDTO.MapDBAssessmentTemplateToDTOAssessmentTemplate(template)
	}

	return result, nil
}

func UpdateAssessmentTemplate(ctx context.Context, templateID uuid.UUID, req assessmentTemplateDTO.UpdateAssessmentTemplateRequest) error {
	// First check if template exists
	_, err := GetAssessmentTemplate(ctx, templateID)
	if err != nil {
		return err
	}

	tx, err := AssessmentTemplateServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentTemplateServiceSingleton.queries.WithTx(tx)

	var description pgtype.Text
	if req.Description != "" {
		description = pgtype.Text{String: req.Description, Valid: true}
	}

	err = qtx.UpdateAssessmentTemplate(ctx, db.UpdateAssessmentTemplateParams{
		ID:          templateID,
		Name:        req.Name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("Failed to update assessment template")
		return err
	}

	return tx.Commit(ctx)
}

func DeleteAssessmentTemplate(ctx context.Context, templateID uuid.UUID) error {
	tx, err := AssessmentTemplateServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := AssessmentTemplateServiceSingleton.queries.WithTx(tx)

	err = qtx.DeleteAssessmentTemplate(ctx, templateID)
	if err != nil {
		log.WithError(err).Error("Failed to delete assessment template")
		return err
	}

	return tx.Commit(ctx)
}

func GetCoursePhasesByAssessmentTemplate(ctx context.Context, assessmentTemplateID uuid.UUID) ([]uuid.UUID, error) {
	coursePhaseIDs, err := AssessmentTemplateServiceSingleton.queries.GetCoursePhasesByAssessmentTemplate(ctx, assessmentTemplateID)
	if err != nil {
		log.WithError(err).Error("Failed to get course phases by assessment template")
		return nil, err
	}

	return coursePhaseIDs, nil
}
