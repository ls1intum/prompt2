package rubricDTO

import "github.com/google/uuid"

// CreateRubricRequest is the body used to create a rubric.
type CreateRubricRequest struct {
	CompetencyID uuid.UUID `json:"competencyID"`
	Level        int16     `json:"level"`
	Description  string    `json:"description"`
}
