package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CoursePhaseConfig struct {
	AssessmentTemplateID   uuid.UUID `json:"assessmentTemplateId"`
	CoursePhaseID          uuid.UUID `json:"coursePhaseId"`
	Deadline               time.Time `json:"deadline"`
	SelfAssessmentEnabled  bool      `json:"selfAssessmentEnabled"`
	SelfAssessmentTemplate uuid.UUID `json:"selfAssessmentTemplate,omitempty"`
	SelfAssessmentDeadline time.Time `json:"selfAssessmentDeadline,omitempty"`
	PeerAssessmentEnabled  bool      `json:"peerAssessmentEnabled"`
	PeerAssessmentTemplate uuid.UUID `json:"peerAssessmentTemplate,omitempty"`
	PeerAssessmentDeadline time.Time `json:"peerAssessmentDeadline,omitempty"`
}

func MapDBCoursePhaseConfigToDTOCoursePhaseConfig(dbConfig db.CoursePhaseConfig) CoursePhaseConfig {
	return CoursePhaseConfig{
		AssessmentTemplateID:   dbConfig.AssessmentTemplateID,
		CoursePhaseID:          dbConfig.CoursePhaseID,
		Deadline:               dbConfig.Deadline.Time,
		SelfAssessmentEnabled:  dbConfig.SelfAssessmentEnabled,
		SelfAssessmentTemplate: dbConfig.SelfAssessmentTemplate,
		SelfAssessmentDeadline: dbConfig.SelfAssessmentDeadline.Time,
		PeerAssessmentEnabled:  dbConfig.PeerAssessmentEnabled,
		PeerAssessmentTemplate: dbConfig.PeerAssessmentTemplate,
		PeerAssessmentDeadline: dbConfig.PeerAssessmentDeadline.Time,
	}
}
