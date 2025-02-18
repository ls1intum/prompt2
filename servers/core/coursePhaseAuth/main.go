package coursePhaseAuth

// this package offers authentication for external course phases

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloakTokenVerifier"
)

func InitCoursePhaseAuthModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCoursePhaseAuthRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware)
	CoursePhaseAuthServiceSingleton = &CoursePhaseAuthService{
		queries: queries,
		conn:    conn,
	}
}
