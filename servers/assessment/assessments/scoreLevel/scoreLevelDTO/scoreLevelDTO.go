package scoreLevelDTO

import (
	"log"

	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type ScoreLevel string

const (
	ScoreLevelVeryBad  ScoreLevel = "veryBad"
	ScoreLevelBad      ScoreLevel = "bad"
	ScoreLevelOk       ScoreLevel = "ok"
	ScoreLevelGood     ScoreLevel = "good"
	ScoreLevelVeryGood ScoreLevel = "veryGood"
	ScoreLevelUnknown  ScoreLevel = "unknown"
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
		log.Printf("Unknown score level received: %s", scoreLevel)
		return ScoreLevelUnknown
	}
}

func MapDTOtoDBScoreLevel(scoreLevel ScoreLevel) db.ScoreLevel {
	switch scoreLevel {
	case ScoreLevelVeryBad:
		return db.ScoreLevelVeryBad
	case ScoreLevelBad:
		return db.ScoreLevelBad
	case ScoreLevelOk:
		return db.ScoreLevelOk
	case ScoreLevelGood:
		return db.ScoreLevelGood
	case ScoreLevelVeryGood:
		return db.ScoreLevelVeryGood
	default:
		log.Printf("Unknown score level received: %s", scoreLevel)
		return db.ScoreLevelVeryBad
	}
}
