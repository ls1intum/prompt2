package categoryDTO

import "github.com/google/uuid"

type UpdateCategoryRequest struct {
	Name                 string    `json:"name"`
	ShortName            string    `json:"shortName"`
	Description          string    `json:"description"`
	Weight               int32     `json:"weight"`
	AssessmentSchemaID uuid.UUID `json:"assessmentSchemaID"` // This field is required for the update operation
}
