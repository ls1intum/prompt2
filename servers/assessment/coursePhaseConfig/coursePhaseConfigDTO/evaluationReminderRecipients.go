package coursePhaseConfigDTO

import (
	"time"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentType"
)

type EvaluationReminderRecipients struct {
	EvaluationType                         assessmentType.AssessmentType `json:"evaluationType"`
	EvaluationEnabled                      bool                          `json:"evaluationEnabled"`
	Deadline                               *time.Time                    `json:"deadline"`
	DeadlinePassed                         bool                          `json:"deadlinePassed"`
	IncompleteAuthorCourseParticipationIDs []uuid.UUID                   `json:"incompleteAuthorCourseParticipationIDs"`
	TotalAuthors                           int                           `json:"totalAuthors"`
	CompletedAuthors                       int                           `json:"completedAuthors"`
}
