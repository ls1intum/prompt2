package config

import (
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
)

type ConfigService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

func NewConfigService(queries db.Queries, conn *pgxpool.Pool) *ConfigService {
	return &ConfigService{
		queries: queries,
		conn:    conn,
	}
}
