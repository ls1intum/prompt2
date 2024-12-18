package coursePhase

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitCoursePhaseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCoursePhaseRouter(routerGroup)
	CoursePhaseServiceSingleton = &CoursePhaseService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}
