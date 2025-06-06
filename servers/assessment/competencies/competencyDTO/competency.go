package competencyDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Competency struct {
	ID                  uuid.UUID `json:"id"`
	CategoryID          uuid.UUID `json:"categoryID"`
	Name                string    `json:"name"`
	ShortName           string    `json:"shortName"`
	Description         string    `json:"description"`
	DescriotionVeryBad  string    `json:"descriptionVeryBad"`
	DescriptionBad      string    `json:"descriptionBad"`
	DescriptionOk       string    `json:"descriptionOk"`
	DescriptionGood     string    `json:"descriptionGood"`
	DescriptionVeryGood string    `json:"descriptionVeryGood"`
	Weight              int32     `json:"weight"`
}

func GetCompetencyDTOsFromDBModels(dbCompetencies []db.Competency) []Competency {
	competencies := make([]Competency, 0, len(dbCompetencies))
	for _, c := range dbCompetencies {
		competencies = append(competencies, Competency{
			ID:                  c.ID,
			CategoryID:          c.CategoryID,
			Name:                c.Name,
			ShortName:           c.ShortName.String,
			Description:         c.Description.String,
			DescriotionVeryBad:  c.DescriptionVeryBad,
			DescriptionBad:      c.DescriptionBad,
			DescriptionOk:       c.DescriptionOk,
			DescriptionGood:     c.DescriptionGood,
			DescriptionVeryGood: c.DescriptionVeryGood,
			Weight:              c.Weight,
		})
	}
	return competencies
}
