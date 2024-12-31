package applicationAdministration

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	log "github.com/sirupsen/logrus"
)

func InitApplicationAdministrationModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupApplicationRouter(routerGroup, keycloak.KeycloakMiddleware, keycloak.ApplicationMiddleware, checkAccessControlByIDWrapper)
	ApplicationServiceSingleton = &ApplicationService{
		queries: queries,
		conn:    conn,
	}

	// check if the application module exists in the types
	ctx := context.Background()
	exists, err := ApplicationServiceSingleton.queries.TestApplicationPhaseTypeExists(ctx)
	if err != nil {
		log.Error("failed to check if application phase type exists: ", err)
	}
	if !exists {
		// create the application module
		newApplicationPhaseType := db.CreateCoursePhaseTypeParams{
			ID:           uuid.New(),
			Name:         "Application",
			InitialPhase: true,
		}
		err := ApplicationServiceSingleton.queries.CreateCoursePhaseType(ctx, newApplicationPhaseType)
		if err != nil {
			log.Error("failed to create application module: ", err)
		}
	} else {
		log.Debug("application module already exists")
	}
}

// initializes the handler func with CheckCoursePermissions
func checkAccessControlByIDWrapper(allowedRoles ...string) gin.HandlerFunc {
	return permissionValidation.CheckAccessControlByID(permissionValidation.CheckCoursePhasePermission, "coursePhaseID", allowedRoles...)
}
