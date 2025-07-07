package evaluationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Evaluation struct {
	ID                          uuid.UUID                `json:"id"`
	CourseParticipationID       uuid.UUID                `json:"courseParticipationID"`
	CoursePhaseID               uuid.UUID                `json:"coursePhaseID"`
	CompetencyID                uuid.UUID                `json:"competencyID"`
	ScoreLevel                  scoreLevelDTO.ScoreLevel `json:"scoreLevel"`
	AuthorCourseParticipationID uuid.UUID                `json:"authorCourseParticipationID"`
	EvaluatedAt                 pgtype.Timestamptz       `json:"evaluatedAt"`
}

func MapToEvaluationDTO(evaluation db.Evaluation) Evaluation {
	return Evaluation{
		ID:                          evaluation.ID,
		CourseParticipationID:       evaluation.CourseParticipationID,
		CoursePhaseID:               evaluation.CoursePhaseID,
		CompetencyID:                evaluation.CompetencyID,
		ScoreLevel:                  scoreLevelDTO.MapDBScoreLevelToDTO(evaluation.ScoreLevel),
		AuthorCourseParticipationID: evaluation.AuthorCourseParticipationID,
		EvaluatedAt:                 evaluation.EvaluatedAt,
	}
}

func MapToEvaluationDTOs(evaluations []db.Evaluation) []Evaluation {
	result := make([]Evaluation, len(evaluations))
	for i, evaluation := range evaluations {
		result[i] = MapToEvaluationDTO(evaluation)
	}
	return result
}
