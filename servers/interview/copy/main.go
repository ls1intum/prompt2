package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
)

func InitCopyModule(routerGroup *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	service := NewCopyService(queries, conn)
	SetupCopyRouter(routerGroup, service)
}
