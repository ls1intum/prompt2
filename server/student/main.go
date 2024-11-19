package student

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitStudentModule(api *gin.RouterGroup, queries db.Queries, conn *pgx.Conn) {

	setupStudentRouter(api)
	StudentServiceSingleton = &StudentService{
		queries: queries,
		conn:    conn,
	}

	// possibly more setup tasks
}
