package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakRealmManager"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func InitCourseCopyModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCourseCopyRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, permissionValidation.CheckAccessControlByRole, checkAccessControlByIDWrapper)
	CourseCopyServiceSingleton = &CourseCopyService{
		queries:                    queries,
		conn:                       conn,
		createCourseGroupsAndRoles: keycloakRealmManager.CreateCourseGroupsAndRoles,
	}

	// possibly more setup tasks
}

// initializes the handler func with CheckCoursePermissions
func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePermission, "uuid", allowedRoles...)
}
