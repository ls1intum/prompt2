package feedbackItemDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CreateOrUpdateFeedbackItemRequest struct {
	ID                          *uuid.UUID      `json:"id"` // Optional for create, required for update
	FeedbackType                db.FeedbackType `json:"feedbackType""`
	FeedbackText                string          `json:"feedbackText"`
	CourseParticipationID       uuid.UUID       `json:"courseParticipationID"`
	CoursePhaseID               uuid.UUID       `json:"coursePhaseID"`
	AuthorCourseParticipationID uuid.UUID       `json:"authorCourseParticipationID"`
}

// GetCreateDBModel converts CreateOrUpdateFeedbackItemRequest to create database parameters.
func (r CreateOrUpdateFeedbackItemRequest) GetCreateDBModel() db.CreateFeedbackItemParams {
	return db.CreateFeedbackItemParams{
		ID:                          uuid.New(),
		FeedbackType:                r.FeedbackType,
		FeedbackText:                r.FeedbackText,
		CourseParticipationID:       r.CourseParticipationID,
		CoursePhaseID:               r.CoursePhaseID,
		AuthorCourseParticipationID: r.AuthorCourseParticipationID,
	}
}

// GetUpdateDBModel converts CreateOrUpdateFeedbackItemRequest to update database parameters.
func (r CreateOrUpdateFeedbackItemRequest) GetUpdateDBModel() db.UpdateFeedbackItemParams {
	var id uuid.UUID
	if r.ID != nil {
		id = *r.ID
	}
	return db.UpdateFeedbackItemParams{
		ID:                          id,
		FeedbackType:                r.FeedbackType,
		FeedbackText:                r.FeedbackText,
		CourseParticipationID:       r.CourseParticipationID,
		CoursePhaseID:               r.CoursePhaseID,
		AuthorCourseParticipationID: r.AuthorCourseParticipationID,
	}
}
