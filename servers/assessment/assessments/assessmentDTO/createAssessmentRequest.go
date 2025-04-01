package assessmentDTO

import "github.com/google/uuid"

// CreateAssessmentRequest is the body used to create an assessment.
type CreateAssessmentRequest struct {
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID `json:"coursePhaseID"`
	CompetencyID          uuid.UUID `json:"competencyID"`
	Score                 int16     `json:"score"`
	Comment               string    `json:"comment,omitempty"`
}
