package assessmentDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

// Assessment represents a simplified view of the assessment record.
type Assessment struct {
	ID                    uuid.UUID `json:"id"`
	CourseParticipationID uuid.UUID `json:"courseParticipationId"`
	CoursePhaseID         uuid.UUID `json:"coursePhaseId"`
	CompetencyID          uuid.UUID `json:"competencyId"`
	Score                 int16     `json:"score"`
	Comment               string    `json:"comment,omitempty"`
	AssessedAt            time.Time `json:"assessedAt"`
}

// GetAssessmentDTOsFromDBModels converts DB assessment models into DTOs.
func GetAssessmentDTOsFromDBModels(dbAssessments []db.Assessment) []Assessment {
	assessments := make([]Assessment, len(dbAssessments))
	for i, a := range dbAssessments {
		assessments[i] = Assessment{
			ID:                    a.ID,
			CourseParticipationID: a.CourseParticipationID,
			CoursePhaseID:         a.CoursePhaseID,
			CompetencyID:          a.CompetencyID,
			Score:                 a.Score,
			Comment:               a.Comment.String,
			AssessedAt:            a.AssessedAt.Time,
		}
	}
	return assessments
}
