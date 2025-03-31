package assessmentDTO

// UpdateAssessmentRequest is the body used to update an assessment.
type UpdateAssessmentRequest struct {
	Score   int16  `json:"score"`
	Comment string `json:"comment,omitempty"`
}
