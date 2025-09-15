package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrUpdateCoursePhaseConfigRequest struct {
	AssessmentTemplateID    uuid.UUID `json:"assessmentTemplateId"`
	CoursePhaseID           uuid.UUID `json:"coursePhaseId"`
	Start                   time.Time `json:"start"`
	Deadline                time.Time `json:"deadline"`
	SelfEvaluationEnabled   bool      `json:"selfEvaluationEnabled"`
	SelfEvaluationTemplate  uuid.UUID `json:"selfEvaluationTemplate"`
	SelfEvaluationStart     time.Time `json:"selfEvaluationStart"`
	SelfEvaluationDeadline  time.Time `json:"selfEvaluationDeadline"`
	PeerEvaluationEnabled   bool      `json:"peerEvaluationEnabled"`
	PeerEvaluationTemplate  uuid.UUID `json:"peerEvaluationTemplate"`
	PeerEvaluationStart     time.Time `json:"peerEvaluationStart"`
	PeerEvaluationDeadline  time.Time `json:"peerEvaluationDeadline"`
	TutorEvaluationEnabled  bool      `json:"tutorEvaluationEnabled"`
	TutorEvaluationTemplate uuid.UUID `json:"tutorEvaluationTemplate"`
	TutorEvaluationStart    time.Time `json:"tutorEvaluationStart"`
	TutorEvaluationDeadline time.Time `json:"tutorEvaluationDeadline"`
}
