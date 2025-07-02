package evaluationDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CreateOrUpdateEvaluationRequest struct {
	CourseParticipationID       uuid.UUID     `json:"course_participation_id" binding:"required"`
	CompetencyID                uuid.UUID     `json:"competency_id" binding:"required"`
	ScoreLevel                  db.ScoreLevel `json:"score_level" binding:"required"`
	AuthorCourseParticipationID uuid.UUID     `json:"author_course_participation_id" binding:"required"`
}
