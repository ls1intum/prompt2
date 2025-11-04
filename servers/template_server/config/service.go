package config

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
)

// ConfigService provides phase-level configuration status.
//
// It exposes a GET endpoint used by the template component to check which
// required configurations for a phase are already set and which are still missing.
// The response helps the phase settings page indicate incomplete setup steps
// (e.g. missing survey timeframe, teams, or skills) before activation.
type ConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ConfigServiceSingleton *ConfigService

type TemplateServerConfigHandler struct{}

// HandlePhaseConfig is a placeholder implementation demonstrating the expected
// method signature for phase config handlers. It currently returns 404 until
// the actual functionality is implemented.
func (h *TemplateServerConfigHandler) HandlePhaseConfig(c *gin.Context) (config map[string]bool, err error) {
	c.AbortWithStatus(http.StatusNotFound)
	return nil, nil
}
