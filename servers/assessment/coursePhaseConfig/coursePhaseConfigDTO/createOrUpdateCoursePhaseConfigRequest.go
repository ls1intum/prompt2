package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrUpdateCoursePhaseConfigRequest struct {
	AssessmentTemplateID   uuid.UUID `json:"assessmentTemplateId" binding:"required"`
	Deadline               time.Time `json:"deadline"`
	SelfAssessmentEnabled  bool      `json:"selfAssessmentEnabled"`
	SelfAssessmentTemplate uuid.UUID `json:"selfAssessmentTemplate"`
	SelfAssessmentDeadline time.Time `json:"selfAssessmentDeadline"`
	PeerAssessmentEnabled  bool      `json:"peerAssessmentEnabled"`
	PeerAssessmentTemplate uuid.UUID `json:"peerAssessmentTemplate"`
	PeerAssessmentDeadline time.Time `json:"peerAssessmentDeadline"`
}
