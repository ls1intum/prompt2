package copy

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	promptTypes "github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CopyServiceSingleton *CopyService

type AssessmentCopyHandler struct{}

func (h *AssessmentCopyHandler) HandlePhaseCopy(c *gin.Context, req promptTypes.PhaseCopyRequest) error {
	ctx := c.Request.Context()

	tx, err := CopyServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)

	qtx := CopyServiceSingleton.queries.WithTx(tx)

	// Copy assessment templates
	assessmentTemplates, err := qtx.ListAssessmentTemplates(ctx)
	if err != nil {
		log.Error("could not list assessment templates: ", err)
		return fmt.Errorf("failed to list assessment templates: %w", err)
	}

	for _, template := range assessmentTemplates {
		err = qtx.CreateAssessmentTemplate(ctx, db.CreateAssessmentTemplateParams{
			ID:          template.ID,
			Name:        template.Name,
			Description: template.Description,
		})
		if err != nil {
			log.Error("could not create assessment template: ", err)
			return fmt.Errorf("failed to create assessment template: %w", err)
		}
	}

	// Copy categories
	categories, err := qtx.ListCategories(ctx)
	if err != nil {
		log.Error("could not list categories: ", err)
		return fmt.Errorf("failed to list categories: %w", err)
	}

	for _, category := range categories {
		err = qtx.CreateCategory(ctx, db.CreateCategoryParams{
			ID:            category.ID,
			Name:          category.Name,
			ShortName:     category.ShortName,
			Description:   category.Description,
			Weight:        category.Weight,
			CoursePhaseID: req.TargetCoursePhaseID,
		})
		if err != nil {
			log.Error("could not create category: ", err)
			return fmt.Errorf("failed to create category: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit phase copy: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
