package interviewSlotDTO

import (
	"time"

	"github.com/google/uuid"
)

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
