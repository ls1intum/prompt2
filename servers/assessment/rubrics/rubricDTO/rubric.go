package rubricDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

// Rubric represents a simplified view of the rubric record.
type Rubric struct {
	ID           uuid.UUID `json:"id"`
	CompetencyID uuid.UUID `json:"competencyId"`
	Level        int16     `json:"level"`
	Description  string    `json:"description"`
}

// GetRubricDTOsFromDBModels converts DB rubric models into DTOs.
func GetRubricDTOsFromDBModels(dbRubrics []db.Rubric) []Rubric {
	rubrics := make([]Rubric, len(dbRubrics))
	for i, r := range dbRubrics {
		rubrics[i] = Rubric{
			ID:           r.ID,
			CompetencyID: r.CompetencyID,
			Level:        r.Level,
			Description:  r.Description,
		}
	}
	return rubrics
}
