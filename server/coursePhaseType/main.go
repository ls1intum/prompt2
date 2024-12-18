package coursePhaseType

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitCoursePhaseTypeModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCoursePhaseTypeRouter(routerGroup)
	CoursePhaseTypeServiceSingleton = &CoursePhaseTypeService{
		queries: queries,
		conn:    conn,
	}
}
