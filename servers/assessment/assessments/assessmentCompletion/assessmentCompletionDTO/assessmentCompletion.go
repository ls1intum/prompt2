package assessmentCompletionDTO

import (
	"fmt"

	log "github.com/sirupsen/logrus"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type AssessmentCompletion struct {
	CourseParticipationID uuid.UUID          `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID          `json:"coursePhaseID"`
	CompletedAt           pgtype.Timestamptz `json:"completedAt"`
	Author                string             `json:"author"`
	Completed             bool               `json:"completed"`
	Comment               string             `json:"comment"`
	GradeSuggestion       float64            `json:"gradeSuggestion"`
}

func MapFloat64ToNumeric(gradeSuggestion float64) pgtype.Numeric {
	var x pgtype.Numeric
	err := x.Scan(fmt.Sprintf("%v", gradeSuggestion))
	if err != nil {
		log.Printf("Error converting float64 to Numeric: %v", err)
		// Return an empty Numeric if conversion fails
		return pgtype.Numeric{}
	}
	return x
}

func MapNumericToFloat64(gradeSuggestion pgtype.Numeric) float64 {
	x, err := gradeSuggestion.Float64Value()
	if err != nil {
		return 0.0 // Return an empty Float8 if conversion fails
	}
	return x.Float64
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
		Completed:             dbAssessment.Completed,
		Comment:               dbAssessment.Comment,
		GradeSuggestion:       MapNumericToFloat64(dbAssessment.GradeSuggestion),
	}
}
