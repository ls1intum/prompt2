package actionItemDTO

import "github.com/google/uuid"

type CreateActionItemRequest struct {
	CoursePhaseID         uuid.UUID `json:"coursePhaseID"`
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	Action                string    `json:"action"`
	Author                string    `json:"author"`
}
