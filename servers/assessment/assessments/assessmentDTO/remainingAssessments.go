package assessmentDTO

import (
	"encoding/json"
	"log"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CategoryWithRemainingAssessments struct {
	CategoryID           uuid.UUID `json:"categoryID"`
	RemainingAssessments int32     `json:"remainingAssessments"`
}

type RemainingAssessments struct {
	RemainingAssessments int32                              `json:"remainingAssessments"`
	Categories           []CategoryWithRemainingAssessments `json:"categories"`
}

func MapToRemainingAssessmentsDTO(remainingAssessments db.CountRemainingAssessmentsForStudentRow) RemainingAssessments {
	var result RemainingAssessments

	var categories []CategoryWithRemainingAssessments
	result.RemainingAssessments = remainingAssessments.RemainingAssessments
	if remainingAssessments.Categories != nil {
		if err := json.Unmarshal(remainingAssessments.Categories, &categories); err != nil {
			log.Printf("Error unmarshalling categories for remaining assessments: %v", err)
		}
	}
	result.Categories = categories

	return result
}
