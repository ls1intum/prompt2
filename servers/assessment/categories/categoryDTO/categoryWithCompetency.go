package categoryDTO

import (
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CategoryWithCompetencies struct {
	ID           uuid.UUID                  `json:"id"`
	Name         string                     `json:"name"`
	Description  string                     `json:"description"`
	Weight       int32                      `json:"weight"`
	Competencies []competencyDTO.Competency `json:"competencies"`
}

func MapToCategoryWithCompetenciesDTO(rows []db.GetCategoriesWithCompetenciesRow) []CategoryWithCompetencies {
	var result []CategoryWithCompetencies

	for _, row := range rows {
		var competencies []competencyDTO.Competency
		if row.Competencies != nil {
			if err := json.Unmarshal(row.Competencies, &competencies); err != nil {
				log.Printf("Error unmarshalling competencies for category %s: %v", row.ID, err)
				continue
			}
		}

		category := CategoryWithCompetencies{
			ID:           row.ID,
			Name:         row.Name,
			Description:  row.Description.String,
			Weight:       row.Weight,
			Competencies: competencies,
		}
		result = append(result, category)
	}

	return result
}
