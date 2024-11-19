package coursePhaseParticipation

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitCoursePhaseParticipationModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgx.Conn) {
	setupCoursePhaseParticipationRouter(routerGroup)
	CoursePhaseParticipationServiceSingleton = &CoursePhaseParticipationService{
		queries: queries,
		conn:    conn,
	}
}
