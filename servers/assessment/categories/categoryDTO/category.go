package categoryDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Category struct {
	ID                   uuid.UUID `json:"id"`
	Name                 string    `json:"name"`
	ShortName            string    `json:"shortName"`
	Description          string    `json:"description"`
	Weight               int32     `json:"weight"`
	AssessmentTemplateID uuid.UUID `json:"assessmentTemplateID"`
}

func GetCategoryDTOsFromDBModels(dbCategories []db.Category) []Category {
	categories := make([]Category, 0, len(dbCategories))
	for _, c := range dbCategories {
		categories = append(categories, Category{
			ID:                   c.ID,
			Name:                 c.Name,
			ShortName:            c.ShortName.String,
			Description:          c.Description.String,
			Weight:               c.Weight,
			AssessmentTemplateID: c.AssessmentTemplateID,
		})
	}
	return categories
}
