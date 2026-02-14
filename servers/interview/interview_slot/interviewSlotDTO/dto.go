package interviewSlotDTO

import (
	"time"

	"github.com/google/uuid"
)

type SelfParticipationResponse struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
}

type CreateInterviewSlotRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Location  *string   `json:"location"`
	Capacity  int32     `json:"capacity" binding:"required,min=1"`
}

type UpdateInterviewSlotRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Location  *string   `json:"location"`
	Capacity  int32     `json:"capacity" binding:"required,min=1"`
}

type CreateInterviewAssignmentRequest struct {
	InterviewSlotID uuid.UUID `json:"interview_slot_id" binding:"required"`
}

type CreateInterviewAssignmentAdminRequest struct {
	InterviewSlotID       uuid.UUID `json:"interview_slot_id" binding:"required"`
	CourseParticipationID uuid.UUID `json:"course_participation_id" binding:"required"`
}

type StudentInfo struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
}

type AssignmentInfo struct {
	ID                    uuid.UUID    `json:"id"`
	CourseParticipationID uuid.UUID    `json:"course_participation_id"`
	AssignedAt            time.Time    `json:"assigned_at"`
	Student               *StudentInfo `json:"student,omitempty"`
}

type InterviewSlotResponse struct {
	ID            uuid.UUID        `json:"id"`
	CoursePhaseID uuid.UUID        `json:"course_phase_id"`
	StartTime     time.Time        `json:"start_time"`
	EndTime       time.Time        `json:"end_time"`
	Location      *string          `json:"location"`
	Capacity      int32            `json:"capacity"`
	AssignedCount int64            `json:"assigned_count"`
	Assignments   []AssignmentInfo `json:"assignments"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
}

type InterviewAssignmentResponse struct {
	ID                    uuid.UUID              `json:"id"`
	InterviewSlotID       uuid.UUID              `json:"interview_slot_id"`
	CourseParticipationID uuid.UUID              `json:"course_participation_id"`
	AssignedAt            time.Time              `json:"assigned_at"`
	SlotDetails           *InterviewSlotResponse `json:"slot_details,omitempty"`
}
