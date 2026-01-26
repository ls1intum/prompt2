package instructorNote

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func InitInstructorNoteModule(api *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {

	setupInstructorNoteRouter(api, keycloakTokenVerifier.KeycloakMiddleware, permissionValidation.CheckAccessControlByRole)
	InstructorNoteServiceSingleton = &InstructorNoteService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}

