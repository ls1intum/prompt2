package coursePhaseAuth

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func InitCoursePhaseAuthModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupCoursePhaseAuthRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, checkAccessControlByCourseIDWrapper)
	CoursePhaseAuthServiceSingleton = &CoursePhaseAuthService{
		queries: queries,
		conn:    conn,
	}
}

func checkAccessControlByCourseIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "coursePhaseID", allowedRoles...)
}
