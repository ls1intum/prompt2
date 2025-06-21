package competencyDTO

import "github.com/google/uuid"

type CreateCompetencyRequest struct {
	CategoryID          uuid.UUID `json:"categoryID"`
	Name                string    `json:"name"`
	ShortName           string    `json:"shortName"`
	Description         string    `json:"description"`
	DescriptionVeryBad  string    `json:"descriptionVeryBad"`
	DescriptionBad      string    `json:"descriptionBad"`
	DescriptionOk       string    `json:"descriptionOk"`
	DescriptionGood     string    `json:"descriptionGood"`
	DescriptionVeryGood string    `json:"descriptionVeryGood"`
	Weight              int32     `json:"weight"`
}
