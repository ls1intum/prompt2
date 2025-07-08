package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptTypes "github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CopyServiceSingleton *CopyService

type TeamAllocationCopyHandler struct{}

func (h *TeamAllocationCopyHandler) HandlePhaseCopy(c *gin.Context, req promptTypes.PhaseCopyRequest) error {
	skills, err := CopyServiceSingleton.queries.GetSkillsByCoursePhase(c.Request.Context(), req.SourceCoursePhaseID)
	if err != nil {
		return err
	}

	// Copy skills to the new course phase
	for _, skill := range skills {
		err := CopyServiceSingleton.queries.CreateSkill(c.Request.Context(), db.CreateSkillParams{
			ID:            uuid.New(),
			Name:          skill.Name,
			CoursePhaseID: req.TargetCoursePhaseID,
		})
		if err != nil {
			return err
		}
	}

	return nil
}
