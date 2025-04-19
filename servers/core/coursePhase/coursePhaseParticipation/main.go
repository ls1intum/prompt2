package coursePhaseParticipation

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloakTokenVerifier"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func InitCoursePhaseParticipationModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool, coreURL string) {
	setupCoursePhaseParticipationRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, checkAccessControlByIDWrapper)
	CoursePhaseParticipationServiceSingleton = &CoursePhaseParticipationService{
		queries: queries,
		conn:    conn,
		coreURL: coreURL,
	}
}

// initializes the handler func with CheckCoursePermissions
func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "uuid", allowedRoles...)
}
