package coursePhaseConfigDTO

import "github.com/google/uuid"

type Team struct {
	ID      uuid.UUID    `json:"id"`
	Name    string       `json:"name"`
	Members []TeamMember `json:"members"`
}

type TeamMember struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	StudentName           string    `json:"studentName"`
}
