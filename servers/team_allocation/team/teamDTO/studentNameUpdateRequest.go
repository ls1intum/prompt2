package teamDTO

import "github.com/google/uuid"

type StudentNameUpdateRequest struct {
	CoursePhaseID     uuid.UUID            `json:"coursePhaseID"`
	StudentNamesPerID map[uuid.UUID]string `json:"studentNames"` // courseParticipationID -> fullName
}
