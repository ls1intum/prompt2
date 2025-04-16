package assessmentCompletionDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type AssessmentCompletion struct {
	CourseParticipationID uuid.UUID        `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID        `json:"coursePhaseID"`
	CompletedAt           pgtype.Timestamp `json:"completedAt"`
	Author                string           `json:"author"`
	Completed             bool             `json:"completed"`
}

// GetAssessmentCompletionDTOsFromDBModels converts a slice of db.AssessmentCompletion to DTOs.
func GetAssessmentCompletionDTOsFromDBModels(dbAssessments []db.AssessmentCompletion) []AssessmentCompletion {
	assessmentCompletions := make([]AssessmentCompletion, 0, len(dbAssessments))
	for _, a := range dbAssessments {
		assessmentCompletions = append(assessmentCompletions, MapDBAssessmentCompletionToAssessmentCompletionDTO(a))
	}
	return assessmentCompletions
}

func MapDBAssessmentCompletionToAssessmentCompletionDTO(dbAssessment db.AssessmentCompletion) AssessmentCompletion {
	return AssessmentCompletion{
		CourseParticipationID: dbAssessment.CourseParticipationID,
		CoursePhaseID:         dbAssessment.CoursePhaseID,
		CompletedAt:           dbAssessment.CompletedAt,
		Author:                dbAssessment.Author,
		Completed:             true,
	}
}
