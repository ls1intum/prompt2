package tutors

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
)

// name has to be the same constant as in the corresponding micro frontend
const KEYCLOAK_GROUP_NAME = "introCourseTutors"

func InitTutorModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	setupTutorRouter(routerGroup, keycloakTokenVerifier.AuthenticationMiddleware)
	TutorServiceSingleton = &TutorService{
		queries: queries,
		conn:    conn,
	}
}
