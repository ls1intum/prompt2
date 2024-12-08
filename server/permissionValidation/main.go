package permissionValidation

import (
	"github.com/jackc/pgx/v5"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type ValidationService struct {
	queries db.Queries
	conn    *pgx.Conn
}

var ValidationServiceSingleton *ValidationService

func InitValidationService(queries db.Queries, conn *pgx.Conn) {
	ValidationServiceSingleton = &ValidationService{
		queries: queries,
		conn:    conn,
	}
}
