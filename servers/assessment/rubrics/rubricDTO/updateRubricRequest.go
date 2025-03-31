package rubricDTO

// UpdateRubricRequest is the body used to update a rubric.
type UpdateRubricRequest struct {
	Level       int16  `json:"level"`
	Description string `json:"description"`
}
