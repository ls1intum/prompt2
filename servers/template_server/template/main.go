package template

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
)

func InitTemplateModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupTemplateRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	TemplateServiceSingleton = &TemplateService{
		queries: queries,
		conn:    conn,
	}
}
