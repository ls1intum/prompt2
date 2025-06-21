package courseParticipation

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func InitCourseParticipationModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupCourseParticipationRouter(routerGroup, keycloakTokenVerifier.KeycloakMiddleware, checkAccessControlByIDWrapper)
	CourseParticipationServiceSingleton = &CourseParticipationService{
		queries: queries,
		conn:    conn,
	}
}

// initializes the handler func with CheckCoursePermissions
func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePermission, "uuid", allowedRoles...)
}
