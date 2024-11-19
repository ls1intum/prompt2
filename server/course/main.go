package course

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitCourseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgx.Conn) {

	setupCourseRouter(routerGroup)
	CourseServiceSingleton = &CourseService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}
