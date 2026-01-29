package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CopyServiceSingleton *CopyService

type SelfTeamCopyHandler struct{}

func (h *SelfTeamCopyHandler) HandlePhaseCopy(c *gin.Context, req promptTypes.PhaseCopyRequest) error {
	return nil
}
