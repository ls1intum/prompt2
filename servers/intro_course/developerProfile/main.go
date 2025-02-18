package developerProfile

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

func InitDeveloperProfileModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	// setupCourseRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, permissionValidation.CheckAccessControlByRole, checkAccessControlByIDWrapper)
	// CourseServiceSingleton = &CourseService{
	// 	queries:                    queries,
	// 	conn:                       conn,
	// 	createCourseGroupsAndRoles: keycloakRealmManager.CreateCourseGroupsAndRoles,
	// }

	// possibly more setup tasks
}

// initializes the handler func with CheckCoursePermissions
// func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
// 	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePermission, "uuid", allowedRoles...)
// }
