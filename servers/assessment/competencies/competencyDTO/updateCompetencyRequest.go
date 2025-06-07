package competencyDTO

import "github.com/google/uuid"

type UpdateCompetencyRequest struct {
	Name         string    `json:"name"`
	ShortName    string    `json:"shortName"`
	CategoryID   uuid.UUID `json:"categoryID"`
	Description  string    `json:"description"`
	Novice       string    `json:"novice"`
	Intermediate string    `json:"intermediate"`
	Advanced     string    `json:"advanced"`
	Expert       string    `json:"expert"`
	Weight       int32     `json:"weight"`
}
