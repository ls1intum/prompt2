package categoryDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type Category struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
}

func GetCategoryDTOsFromDBModels(dbCategories []db.Category) []Category {
	categories := make([]Category, len(dbCategories))
	for i, c := range dbCategories {
		categories[i] = Category{
			ID:          c.ID,
			Name:        c.Name,
			Description: c.Description.String,
		}
	}
	return categories
}
