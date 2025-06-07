package scoreLevelDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type StudentScore struct {
	ScoreLevel ScoreLevel    `json:"scoreLevel"`
	Score      pgtype.Float8 `json:"score"`
}
