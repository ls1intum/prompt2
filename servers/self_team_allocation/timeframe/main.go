package timeframe

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
)

func InitTimeframeModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupTimeframeRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	TimeframeServiceSingleton = &TimeframeService{
		queries: queries,
		conn:    conn,
	}
}
