package teaseDTO

import (
	"github.com/google/uuid"
)

type AllocationRequest struct {
	ID                    uuid.UUID `json:"id"`
	CourseParticipationID uuid.UUID `json:"course_participation_id"`
	TeamID                uuid.UUID `json:"team_id"`
	CoursePhaseID         uuid.UUID `json:"course_phase_id"`
}
