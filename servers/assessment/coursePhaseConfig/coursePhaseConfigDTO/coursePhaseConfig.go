package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CoursePhaseConfig struct {
	AssessmentTemplateID   uuid.UUID `json:"assessmentTemplateID"`
	CoursePhaseID          uuid.UUID `json:"coursePhaseID"`
	Deadline               time.Time `json:"deadline"`
	SelfEvaluationEnabled  bool      `json:"selfEvaluationEnabled"`
	SelfEvaluationTemplate uuid.UUID `json:"selfEvaluationTemplate,omitempty"`
	SelfEvaluationDeadline time.Time `json:"selfEvaluationDeadline,omitempty"`
	PeerEvaluationEnabled  bool      `json:"peerEvaluationEnabled"`
	PeerEvaluationTemplate uuid.UUID `json:"peerEvaluationTemplate,omitempty"`
	PeerEvaluationDeadline time.Time `json:"peerEvaluationDeadline,omitempty"`
}

func MapDBCoursePhaseConfigToDTOCoursePhaseConfig(dbConfig db.CoursePhaseConfig) CoursePhaseConfig {
	return CoursePhaseConfig{
		AssessmentTemplateID:   dbConfig.AssessmentTemplateID,
		CoursePhaseID:          dbConfig.CoursePhaseID,
		Deadline:               dbConfig.Deadline.Time,
		SelfEvaluationEnabled:  dbConfig.SelfEvaluationEnabled,
		SelfEvaluationTemplate: dbConfig.SelfEvaluationTemplate,
		SelfEvaluationDeadline: dbConfig.SelfEvaluationDeadline.Time,
		PeerEvaluationEnabled:  dbConfig.PeerEvaluationEnabled,
		PeerEvaluationTemplate: dbConfig.PeerEvaluationTemplate,
		PeerEvaluationDeadline: dbConfig.PeerEvaluationDeadline.Time,
	}
}
