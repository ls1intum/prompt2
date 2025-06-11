package categoryDTO

import "github.com/google/uuid"

type UpdateCategoryRequest struct {
	Name                 string    `json:"name"`
	ShortName            string    `json:"shortName"`
	Description          string    `json:"description"`
	Weight               int32     `json:"weight"`
	AssessmentTemplateID uuid.UUID `json:"assessmentTemplateID"`
}
