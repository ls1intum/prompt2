package rubricDTO

import "github.com/google/uuid"

// CreateRubricRequest is the body used to create a rubric.
type CreateRubricRequest struct {
	CompetencyID uuid.UUID `json:"competencyId"`
	Level        int16     `json:"level"`
	Description  string    `json:"description"`
}
