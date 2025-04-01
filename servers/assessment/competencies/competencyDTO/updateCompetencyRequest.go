package competencyDTO

import "github.com/google/uuid"

// UpdateCompetencyRequest represents the request body for updating a competency.
type UpdateCompetencyRequest struct {
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	SuperCompetencyID *uuid.UUID `json:"superCompetencyID,omitempty"`
}
