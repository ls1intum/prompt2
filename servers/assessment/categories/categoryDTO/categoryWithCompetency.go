package categoryDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CategoryWithCompetencies struct {
	ID           uuid.UUID                  `json:"id"`
	Name         string                     `json:"name"`
	Description  string                     `json:"description"`
	Competencies []competencyDTO.Competency `json:"competencies"`
}

func MapToCategoryWithCompetenciesDTO(rows []db.GetCategoriesWithCompetenciesRow) []CategoryWithCompetencies {
	categoryMap := make(map[uuid.UUID]*CategoryWithCompetencies)

	for _, row := range rows {
		category, exists := categoryMap[row.ID]
		if !exists {
			category = &CategoryWithCompetencies{
				ID:           row.ID,
				Name:         row.Name,
				Description:  row.Description.String,
				Competencies: []competencyDTO.Competency{},
			}
			categoryMap[row.ID] = category
		}

		competency := competencyDTO.Competency{
			ID:           row.CompetencyID,
			CategoryID:   row.CategoryID,
			Name:         row.CompetencyName,
			Description:  row.CompetencyDescription.String,
			Novice:       row.Novice,
			Intermediate: row.Intermediate,
			Advanced:     row.Advanced,
			Expert:       row.Expert,
		}
		category.Competencies = append(category.Competencies, competency)
	}

	result := make([]CategoryWithCompetencies, 0, len(categoryMap))
	for _, c := range categoryMap {
		result = append(result, *c)
	}
	return result
}
