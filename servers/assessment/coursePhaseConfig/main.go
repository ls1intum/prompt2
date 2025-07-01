package coursePhaseConfig

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

func InitCoursePhaseConfigModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupCoursePhaseRouter(routerGroup, promptSDK.AuthenticationMiddleware)
	CoursePhaseConfigSingleton = &CoursePhaseConfigService{
		queries: queries,
		conn:    conn,
	}
}
