package student

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloakTokenVerifier"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func InitStudentModule(api *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupStudentRouter(api, keycloakTokenVerifier.KeycloakMiddleware, permissionValidation.CheckAccessControlByRole)
	StudentServiceSingleton = &StudentService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}
