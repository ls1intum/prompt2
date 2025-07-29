package assessmentCompletionDTO

import "github.com/google/uuid"

type BulkMarkAssessmentCompletionRequest struct {
	CourseParticipationIDs []uuid.UUID `json:"courseParticipationIDs" binding:"required"`
	Author                 string      `json:"author" binding:"required"`
}
