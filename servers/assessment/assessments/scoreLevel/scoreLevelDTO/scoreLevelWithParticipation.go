package scoreLevelDTO

import (
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type ScoreLevelWithParticipation struct {
	CourseParticipationID string        `json:"courseParticipationID"`
	ScoreLevel            db.ScoreLevel `json:"scoreLevel"`
}

func GetScoreLevelsFromDBScoreLevels(scoreLevels []db.GetAllScoreLevelsRow) []ScoreLevelWithParticipation {
	scoreLevelWithParticipation := make([]ScoreLevelWithParticipation, 0, len(scoreLevels))
	for _, scoreLevel := range scoreLevels {
		scoreLevelWithParticipation = append(scoreLevelWithParticipation, ScoreLevelWithParticipation{
			CourseParticipationID: scoreLevel.CourseParticipationID.String(),
			ScoreLevel:            db.ScoreLevel(scoreLevel.ScoreLevel),
		})
	}
	return scoreLevelWithParticipation
}

func MapToScoreLevelWithParticipation(scoreLevel db.GetAllScoreLevelsRow) ScoreLevelWithParticipation {
	return ScoreLevelWithParticipation{
		CourseParticipationID: scoreLevel.CourseParticipationID.String(),
		ScoreLevel:            db.ScoreLevel(scoreLevel.ScoreLevel),
	}
}
