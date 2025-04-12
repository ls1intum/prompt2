package tease

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

func InitTeaseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupTeaseRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	TeaseServiceSingleton = &TeaseService{
		queries: queries,
		conn:    conn,
	}
}
