package coursePhase

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func InitCoursePhaseModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupCoursePhaseRouter(routerGroup, keycloak.KeycloakMiddleware, checkAccessControlByIDWrapper, checkAccessControlByCourseIDWrapper)
	CoursePhaseServiceSingleton = &CoursePhaseService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}

func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "uuid", allowedRoles...)
}

func checkAccessControlByCourseIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePermission, "courseID", allowedRoles...)
}
