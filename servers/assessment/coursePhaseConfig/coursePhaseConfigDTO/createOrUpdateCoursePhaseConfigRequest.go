package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrUpdateCoursePhaseConfigRequest struct {
	AssessmentTemplateID   uuid.UUID `json:"assessmentTemplateId" binding:"required"`
	Deadline               time.Time `json:"deadline"`
	SelfEvaluationEnabled  bool      `json:"selfEvaluationEnabled"`
	SelfEvaluationTemplate uuid.UUID `json:"selfEvaluationTemplate"`
	SelfEvaluationDeadline time.Time `json:"selfEvaluationDeadline"`
	PeerEvaluationEnabled  bool      `json:"peerAssessmentEnabled"`
	PeerEvaluationTemplate uuid.UUID `json:"peerAssessmentTemplate"`
	PeerEvaluationDeadline time.Time `json:"peerAssessmentDeadline"`
}
