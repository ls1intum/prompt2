package competencyDTO

import "github.com/google/uuid"

type CreateCompetencyRequest struct {
	CategoryID   uuid.UUID `json:"categoryID"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Novice       string    `json:"novice"`
	Intermediate string    `json:"intermediate"`
	Advanced     string    `json:"advanced"`
	Expert       string    `json:"expert"`
	Weight       int32     `json:"weight"`
}
