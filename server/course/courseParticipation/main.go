package courseParticipation

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitCourseParticipationModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupCourseParticipationRouter(routerGroup)
	CourseParticipationServiceSingleton = &CourseParticipationService{
		queries: queries,
		conn:    conn,
	}
}
