package allocations

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
)

func InitAllocationsModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupAllocationsRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	AllocationsServiceSingleton = &AllocationsService{
		queries: queries,
		conn:    conn,
	}
}
