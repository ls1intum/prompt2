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

	// Copy course phase config
	phaseConfig, err := qtx.GetCoursePhaseConfig(ctx, req.SourceCoursePhaseID)
	if err != nil {
		log.Error("could not get course phase config: ", err)
		return fmt.Errorf("failed to get course phase config: %w", err)
	}

	err = qtx.CreateOrUpdateCoursePhaseConfig(ctx, db.CreateOrUpdateCoursePhaseConfigParams{
		AssessmentTemplateID:   phaseConfig.AssessmentTemplateID,
		CoursePhaseID:          req.TargetCoursePhaseID,
		Deadline:               phaseConfig.Deadline,
		SelfEvaluationEnabled:  phaseConfig.SelfEvaluationEnabled,
		SelfEvaluationTemplate: phaseConfig.SelfEvaluationTemplate,
		SelfEvaluationDeadline: phaseConfig.SelfEvaluationDeadline,
		PeerEvaluationEnabled:  phaseConfig.PeerEvaluationEnabled,
		PeerEvaluationTemplate: phaseConfig.PeerEvaluationTemplate,
		PeerEvaluationDeadline: phaseConfig.PeerEvaluationDeadline,
	})
	if err != nil {
		log.Error("could not create or update course phase config: ", err)
		return fmt.Errorf("failed to create or update course phase config: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error("could not commit phase copy: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
