package assessmentTemplateDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type AssessmentTemplate struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func MapDBAssessmentTemplateToDTOAssessmentTemplate(dbTemplate db.AssessmentTemplate) AssessmentTemplate {
	return AssessmentTemplate{
		ID:          dbTemplate.ID,
		Name:        dbTemplate.Name,
		Description: dbTemplate.Description.String,
		CreatedAt:   dbTemplate.CreatedAt.Time,
		UpdatedAt:   dbTemplate.UpdatedAt.Time,
	}
}
