package assessmentTemplateDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type AssessmentTemplate struct {
	ID          uuid.UUID        `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	CreatedAt   pgtype.Timestamp `json:"createdAt"`
	UpdatedAt   pgtype.Timestamp `json:"updatedAt"`
}

func MapDBAssessmentTemplateToDTOAssessmentTemplate(dbTemplate db.AssessmentTemplate) AssessmentTemplate {
	return AssessmentTemplate{
		ID:          dbTemplate.ID,
		Name:        dbTemplate.Name,
		Description: dbTemplate.Description.String,
		CreatedAt:   dbTemplate.CreatedAt,
		UpdatedAt:   dbTemplate.UpdatedAt,
	}
}
