package copy

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptTypes "github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CopyServiceSingleton *CopyService

type TeamAllocationCopyHandler struct{}

func (h *TeamAllocationCopyHandler) HandlePhaseCopy(c *gin.Context, req promptTypes.PhaseCopyRequest) error {
	tx, err := CopyServiceSingleton.conn.Begin(c.Request.Context())
	if err != nil {
		return err
	}
	defer tx.Rollback(c.Request.Context())

	qtx := CopyServiceSingleton.queries.WithTx(tx)

	skills, err := qtx.GetSkillsByCoursePhase(c.Request.Context(), req.SourceCoursePhaseID)
	if err != nil {
		return err
	}

	// Copy skills to the new course phase
	for _, skill := range skills {
		err := qtx.CreateSkill(c.Request.Context(), db.CreateSkillParams{
			ID:            uuid.New(),
			Name:          skill.Name,
			CoursePhaseID: req.TargetCoursePhaseID,
		})
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(c.Request.Context()); err != nil {
		log.Error("could not commit phase copy: ", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
