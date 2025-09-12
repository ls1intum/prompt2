package feedbackItemDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentType"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type UpdateFeedbackItemRequest struct {
	ID                          uuid.UUID                     `json:"id" binding:"required,uuid"`
	FeedbackType                db.FeedbackType               `json:"feedbackType" binding:"required,oneof='positive' 'negative'"`
	FeedbackText                string                        `json:"feedbackText" binding:"required"`
	CourseParticipationID       uuid.UUID                     `json:"courseParticipationID" binding:"required,uuid"`
	CoursePhaseID               uuid.UUID                     `json:"coursePhaseID" binding:"required,uuid"`
	AuthorCourseParticipationID uuid.UUID                     `json:"authorCourseParticipationID" binding:"required,uuid"`
	Type                        assessmentType.AssessmentType `json:"type" binding:"required,oneof='self' 'peer' 'tutor' 'assessment'"`
}
