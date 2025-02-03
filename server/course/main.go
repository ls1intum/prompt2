package course

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/keycloakTokenVerifier"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func InitCourseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCourseRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, permissionValidation.CheckAccessControlByRole, checkAccessControlByIDWrapper)
	CourseServiceSingleton = &CourseService{
		queries:                    queries,
		conn:                       conn,
		createCourseGroupsAndRoles: keycloak.CreateCourseGroupsAndRoles,
	}

	// possibly more setup tasks
}

// initializes the handler func with CheckCoursePermissions
func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePermission, "uuid", allowedRoles...)
}
