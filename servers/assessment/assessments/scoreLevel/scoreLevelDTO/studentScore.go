package scoreLevelDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type StudentScore struct {
	ScoreLevel db.ScoreLevel `json:"scoreLevel"`
	Score      pgtype.Float8 `json:"score"`
}
