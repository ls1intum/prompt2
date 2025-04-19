package resolution

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitResolutionModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, coreHost string) {
	ResolutionServiceSingleton = &ResolutionService{
		queries:  queries,
		conn:     conn,
		coreHost: coreHost,
	}
}
