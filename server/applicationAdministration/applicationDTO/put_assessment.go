package applicationDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type PutAssessment struct {
	Score      pgtype.Int4    `json:"score"`
	MetaData   meta.MetaData  `json:"meta_data"`
	PassStatus *db.PassStatus `json:"pass_status"`
}
