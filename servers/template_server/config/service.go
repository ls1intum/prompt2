package config

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
)

type ConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ConfigServiceSingleton *ConfigService

type TemplateServerConfigHandler struct{}

func (h *TemplateServerConfigHandler) HandlePhaseConfig(c *gin.Context) (config map[string]bool, err error) {
	c.AbortWithStatus(http.StatusNotFound)
	return nil, nil
}
