package scoreLevelDTO

import (
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type ScoreLevelWithParticipation struct {
	CourseParticipationID string        `json:"courseParticipationID"`
	ScoreLevel            db.ScoreLevel `json:"scoreLevel"`
}

func GetScoreLevelsFromDBScoreLevels(scoreLevels []db.GetAllScoreLevelsRow) []ScoreLevelWithParticipation {
	scoreLevelWithParticipation := make([]ScoreLevelWithParticipation, len(scoreLevels))
	for i, scoreLevel := range scoreLevels {
		scoreLevelWithParticipation[i] = ScoreLevelWithParticipation{
			CourseParticipationID: scoreLevel.CourseParticipationID.String(),
			ScoreLevel:            db.ScoreLevel(scoreLevel.ScoreLevel),
		}
	}
	return scoreLevelWithParticipation
}

func MapToScoreLevelWithParticipation(scoreLevel db.GetAllScoreLevelsRow) ScoreLevelWithParticipation {
	return ScoreLevelWithParticipation{
		CourseParticipationID: scoreLevel.CourseParticipationID.String(),
		ScoreLevel:            db.ScoreLevel(scoreLevel.ScoreLevel),
	}
}
