package permissionValidation

import (
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type ValidationService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ValidationServiceSingleton *ValidationService

func InitValidationService(queries db.Queries, conn *pgxpool.Pool) {
	ValidationServiceSingleton = &ValidationService{
		queries: queries,
		conn:    conn,
	}
}
