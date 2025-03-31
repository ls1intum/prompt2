package assessmentDTO

import "github.com/google/uuid"

// CreateAssessmentRequest is the body used to create an assessment.
type CreateAssessmentRequest struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationId"`
	CoursePhaseID         uuid.UUID `json:"coursePhaseId"`
	CompetencyID          uuid.UUID `json:"competencyId"`
	Score                 int16     `json:"score"`
	Comment               string    `json:"comment,omitempty"`
}
