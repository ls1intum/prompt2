package categoryDTO

import (
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CategoryWithRemainingAssessments struct {
	CategoryID           uuid.UUID `json:"categoryID"`
	RemainingAssessments int32     `json:"remainingAssessments"`
}

func MapToCategoryWithRemainingAssessments(rows []db.CountRemainingAssessmentsPerCategoryRow) []CategoryWithRemainingAssessments {
	var result []CategoryWithRemainingAssessments

	for _, row := range rows {

		category := CategoryWithRemainingAssessments{
			CategoryID:           row.CategoryID,
			RemainingAssessments: row.RemainingAssessments,
		}
		result = append(result, category)
	}

	return result
}
