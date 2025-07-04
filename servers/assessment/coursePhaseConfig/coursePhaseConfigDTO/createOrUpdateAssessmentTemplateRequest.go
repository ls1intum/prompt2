package coursePhaseConfigDTO

import "github.com/google/uuid"

type CreateOrUpdateAssessmentTemplateRequest struct {
	AssessmentTemplateID uuid.UUID `json:"assessmentTemplateId"`
}
