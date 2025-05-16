package applicationDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
)

type PutAssessment struct {
	Score          pgtype.Int4    `json:"score"`
	RestrictedData meta.MetaData  `json:"restrictedData"`
	PassStatus     *db.PassStatus `json:"passStatus"`
}
