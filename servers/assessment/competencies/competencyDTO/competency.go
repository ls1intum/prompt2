package competencyDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

// Competency represents a simplified view of the competency record.
type Competency struct {
	ID                uuid.UUID  `json:"id"`
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	SuperCompetencyID *uuid.UUID `json:"superCompetencyId,omitempty"`
}

// GetCompetencyDTOsFromDBModels converts a slice of DB competencies to DTOs.
func GetCompetencyDTOsFromDBModels(dbCompetencies []db.Competency) []Competency {
	competencies := make([]Competency, len(dbCompetencies))
	for i, c := range dbCompetencies {
		competencies[i] = Competency{
			ID:                c.ID,
			Name:              c.Name,
			Description:       c.Description.String,
			SuperCompetencyID: &c.SuperCompetencyID,
		}
	}
	return competencies
}
