package feedbackItemDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentType"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CreateFeedbackItemRequest struct {
	FeedbackType                db.FeedbackType               `json:"feedbackType" binding:"required"`
	FeedbackText                string                        `json:"feedbackText"`
	CourseParticipationID       uuid.UUID                     `json:"courseParticipationID" binding:"required"`
	CoursePhaseID               uuid.UUID                     `json:"coursePhaseID" binding:"required"`
	AuthorCourseParticipationID uuid.UUID                     `json:"authorCourseParticipationID" binding:"required"`
	Type                        assessmentType.AssessmentType `json:"type" binding:"required"`
}
