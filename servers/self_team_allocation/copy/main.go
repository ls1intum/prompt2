package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
)

func InitCopyModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupCopyRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	CopyServiceSingleton = &CopyService{
		queries: queries,
		conn:    conn,
	}
}
