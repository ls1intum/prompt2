package competencyDTO

import "github.com/google/uuid"

// CreateCompetencyRequest represents the request body for creating a competency.
type CreateCompetencyRequest struct {
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	SuperCompetencyID *uuid.UUID `json:"superCompetencyId,omitempty"`
}
