package infrastructureSetup

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
)

func InitInfrastructureModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupInfrastructureRouter(routerGroup, keycloakTokenVerifier.AuthenticationMiddleware)
}
