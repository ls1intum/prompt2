package course

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
)

func InitCourseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgx.Conn) {

	setupCourseRouter(routerGroup, keycloak.KeycloakMiddleware)
	CourseServiceSingleton = &CourseService{
		queries:                    queries,
		conn:                       conn,
		createCourseGroupsAndRoles: keycloak.CreateCourseGroupsAndRoles,
	}

	// possibly more setup tasks
}
