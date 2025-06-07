package scoreLevelDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type StudentScore struct {
	ScoreLevel   ScoreLevel    `json:"scoreLevel"`
	ScoreNumeric pgtype.Float8 `json:"numericScore"`
}
