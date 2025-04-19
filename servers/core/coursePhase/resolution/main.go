package resolution

import (
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

func InitResolutionModule(queries db.Queries, conn *pgxpool.Pool, coreHost string) {
	ResolutionServiceSingleton = &ResolutionService{
		queries:  queries,
		conn:     conn,
		coreHost: coreHost,
	}
}
