package evaluationDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
)

type CreateOrUpdateEvaluationRequest struct {
	CourseParticipationID       uuid.UUID                `json:"courseParticipationID" binding:"required"`
	CompetencyID                uuid.UUID                `json:"competencyID" binding:"required"`
	ScoreLevel                  scoreLevelDTO.ScoreLevel `json:"scoreLevel" binding:"required"`
	AuthorCourseParticipationID uuid.UUID                `json:"authorCourseParticipationID" binding:"required"`
}
