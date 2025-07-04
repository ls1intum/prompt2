package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
)

type UpdateAssessmentTemplateRequest struct {
	TemplateID uuid.UUID `json:"template_id" binding:"required"`
}

type UpdateSelfAssessmentDeadlineRequest struct {
	Deadline time.Time `json:"deadline" binding:"required"`
}

type UpdatePeerAssessmentDeadlineRequest struct {
	Deadline time.Time `json:"deadline" binding:"required"`
}
