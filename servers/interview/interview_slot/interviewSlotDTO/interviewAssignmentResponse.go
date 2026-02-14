package interviewSlotDTO

import (
	"time"

	"github.com/google/uuid"
)

type InterviewAssignmentResponse struct {
	ID                    uuid.UUID              `json:"id"`
	InterviewSlotID       uuid.UUID              `json:"interview_slot_id"`
	CourseParticipationID uuid.UUID              `json:"course_participation_id"`
	AssignedAt            time.Time              `json:"assigned_at"`
	SlotDetails           *InterviewSlotResponse `json:"slot_details,omitempty"`
}
