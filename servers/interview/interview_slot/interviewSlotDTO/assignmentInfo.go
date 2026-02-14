package interviewSlotDTO

import (
	"time"

	"github.com/google/uuid"
)

type AssignmentInfo struct {
	ID                    uuid.UUID    `json:"id"`
	CourseParticipationID uuid.UUID    `json:"course_participation_id"`
	AssignedAt            time.Time    `json:"assigned_at"`
	Student               *StudentInfo `json:"student,omitempty"`
}
