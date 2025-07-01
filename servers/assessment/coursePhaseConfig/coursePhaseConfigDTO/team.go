package coursePhaseConfigDTO

import "github.com/google/uuid"

type Team struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
