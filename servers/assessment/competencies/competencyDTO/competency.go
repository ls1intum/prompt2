package competencyDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Competency struct {
	ID           uuid.UUID `json:"id"`
	CategoryID   uuid.UUID `json:"categoryID"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Novice       string    `json:"novice"`
	Intermediate string    `json:"intermediate"`
	Advanced     string    `json:"advanced"`
	Expert       string    `json:"expert"`
	Weight       int32     `json:"weight"`
}

func GetCompetencyDTOsFromDBModels(dbCompetencies []db.Competency) []Competency {
	competencies := make([]Competency, 0, len(dbCompetencies))
	for _, c := range dbCompetencies {
		competencies = append(competencies, Competency{
			ID:           c.ID,
			CategoryID:   c.CategoryID,
			Name:         c.Name,
			Description:  c.Description.String,
			Novice:       c.Novice,
			Intermediate: c.Intermediate,
			Advanced:     c.Advanced,
			Expert:       c.Expert,
			Weight:       c.Weight,
		})
	}
	return competencies
}
