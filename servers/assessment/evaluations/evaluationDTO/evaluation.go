package evaluationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Evaluation struct {
	ID                          uuid.UUID          `json:"id"`
	CourseParticipationID       uuid.UUID          `json:"course_participation_id"`
	CoursePhaseID               uuid.UUID          `json:"course_phase_id"`
	CompetencyID                uuid.UUID          `json:"competency_id"`
	ScoreLevel                  db.ScoreLevel      `json:"score_level"`
	AuthorCourseParticipationID uuid.UUID          `json:"author_course_participation_id"`
	EvaluatedAt                 pgtype.Timestamptz `json:"evaluated_at"`
}

func MapToEvaluationDTO(evaluation db.Evaluation) Evaluation {
	return Evaluation{
		ID:                          evaluation.ID,
		CourseParticipationID:       evaluation.CourseParticipationID,
		CoursePhaseID:               evaluation.CoursePhaseID,
		CompetencyID:                evaluation.CompetencyID,
		ScoreLevel:                  evaluation.ScoreLevel,
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
