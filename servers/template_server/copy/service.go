package copy

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptTypes "github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CopyServiceSingleton *CopyService

type TemplateServerCopyHandler struct{}

// HandlePhaseCopy is a placeholder implementation demonstrating the expected
// method signature for phase copy handlers. It currently returns 404 until
// the actual functionality is implemented.
func (h *TemplateServerCopyHandler) HandlePhaseCopy(c *gin.Context, req promptTypes.PhaseCopyRequest) error {
	c.AbortWithStatus(http.StatusNotFound)
	return nil
}
