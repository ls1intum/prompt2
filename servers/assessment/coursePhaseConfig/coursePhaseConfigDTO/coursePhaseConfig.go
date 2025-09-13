package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CoursePhaseConfig struct {
	CoursePhaseID            uuid.UUID `json:"coursePhaseID"`
	AssessmentTemplateID     uuid.UUID `json:"assessmentTemplateID"`
	Start                    time.Time `json:"start"`
	Deadline                 time.Time `json:"deadline"`
	SelfEvaluationEnabled    bool      `json:"selfEvaluationEnabled"`
	SelfEvaluationTemplate   uuid.UUID `json:"selfEvaluationTemplate"`
	SelfEvaluationStart      time.Time `json:"selfEvaluationStart"`
	SelfEvaluationDeadline   time.Time `json:"selfEvaluationDeadline"`
	PeerEvaluationEnabled    bool      `json:"peerEvaluationEnabled"`
	PeerEvaluationTemplate   uuid.UUID `json:"peerEvaluationTemplate"`
	PeerEvaluationStart      time.Time `json:"peerEvaluationStart"`
	PeerEvaluationDeadline   time.Time `json:"peerEvaluationDeadline"`
	TutorEvaluationEnabled   bool      `json:"tutorEvaluationEnabled"`
	TutorEvaluationTemplate  uuid.UUID `json:"tutorEvaluationTemplate"`
	TutorEvaluationStart     time.Time `json:"tutorEvaluationStart"`
	TutorEvaluationDeadline  time.Time `json:"tutorEvaluationDeadline"`
	EvaluationResultsVisible bool      `json:"evaluationResultsVisible"`
}

func MapDBCoursePhaseConfigToDTOCoursePhaseConfig(dbConfig db.CoursePhaseConfig) CoursePhaseConfig {
	return CoursePhaseConfig{
		CoursePhaseID:            dbConfig.CoursePhaseID,
		AssessmentTemplateID:     dbConfig.AssessmentTemplateID,
		Start:                    dbConfig.Start.Time,
		Deadline:                 dbConfig.Deadline.Time,
		SelfEvaluationEnabled:    dbConfig.SelfEvaluationEnabled,
		SelfEvaluationTemplate:   dbConfig.SelfEvaluationTemplate,
		SelfEvaluationStart:      dbConfig.SelfEvaluationStart.Time,
		SelfEvaluationDeadline:   dbConfig.SelfEvaluationDeadline.Time,
		PeerEvaluationEnabled:    dbConfig.PeerEvaluationEnabled,
		PeerEvaluationTemplate:   dbConfig.PeerEvaluationTemplate,
		PeerEvaluationStart:      dbConfig.PeerEvaluationStart.Time,
		PeerEvaluationDeadline:   dbConfig.PeerEvaluationDeadline.Time,
		TutorEvaluationEnabled:   dbConfig.TutorEvaluationEnabled,
		TutorEvaluationTemplate:  dbConfig.TutorEvaluationTemplate,
		TutorEvaluationStart:     dbConfig.TutorEvaluationStart.Time,
		TutorEvaluationDeadline:  dbConfig.TutorEvaluationDeadline.Time,
		EvaluationResultsVisible: dbConfig.EvaluationResultsVisible,
	}
}
