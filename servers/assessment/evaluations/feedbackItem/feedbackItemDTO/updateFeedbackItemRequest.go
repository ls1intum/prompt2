package feedbackItemDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type UpdateFeedbackItemRequest struct {
	ID                          uuid.UUID       `json:"id"`
	FeedbackType                db.FeedbackType `json:"feedbackType"`
	FeedbackText                string          `json:"feedbackText"`
	CourseParticipationID       uuid.UUID       `json:"courseParticipationID"`
	CoursePhaseID               uuid.UUID       `json:"coursePhaseID"`
	AuthorCourseParticipationID uuid.UUID       `json:"authorCourseParticipationID"`
}
