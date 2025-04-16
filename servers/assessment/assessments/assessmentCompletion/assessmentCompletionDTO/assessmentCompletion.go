package assessmentCompletionDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type AssessmentCompletion struct {
	CourseParticipationID uuid.UUID        `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID        `json:"coursePhaseID"`
	CompletedAt           pgtype.Timestamp `json:"completedAt"`
	Author                string           `json:"author"`
}

// GetAssessmentCompletionDTOsFromDBModels converts a slice of db.AssessmentCompletion to DTOs.
func GetAssessmentCompletionDTOsFromDBModels(dbAssessments []AssessmentCompletion) []AssessmentCompletion {
	assessmentCompletions := make([]AssessmentCompletion, 0, len(dbAssessments))
	for _, a := range dbAssessments {
		assessmentCompletions = append(assessmentCompletions, AssessmentCompletion{
			CourseParticipationID: a.CourseParticipationID,
			CoursePhaseID:         a.CoursePhaseID,
			CompletedAt:           a.CompletedAt,
			Author:                a.Author,
		})
	}
	return assessmentCompletions
}
