package scoreLevelDTO

import db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"

type ScoreLevel string

const (
	ScoreLevelVeryBad  ScoreLevel = "veryBad"
	ScoreLevelBad      ScoreLevel = "bad"
	ScoreLevelOk       ScoreLevel = "ok"
	ScoreLevelGood     ScoreLevel = "good"
	ScoreLevelVeryGood ScoreLevel = "veryGood"
)

func MapDBScoreLevelToDTO(scoreLevel db.ScoreLevel) ScoreLevel {
	switch scoreLevel {
	case "very_bad":
		return ScoreLevelVeryBad
	case "bad":
		return ScoreLevelBad
	case "ok":
		return ScoreLevelOk
	case "good":
		return ScoreLevelGood
	case "very_good":
		return ScoreLevelVeryGood
	default:
		return ""
	}
}
