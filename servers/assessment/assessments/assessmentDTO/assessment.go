package assessmentDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

// Assessment represents a simplified view of the assessment record.
type Assessment struct {
	ID                    uuid.UUID     `json:"id"`
	CourseParticipationID uuid.UUID     `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID     `json:"coursePhaseID"`
	CompetencyID          uuid.UUID     `json:"competencyID"`
	Score                 db.ScoreLevel `json:"score"`
	Comment               string        `json:"comment"`
	AssessedAt            time.Time     `json:"assessedAt"`
}

// GetAssessmentDTOsFromDBModels converts a slice of db.Assessment to DTOs.
func GetAssessmentDTOsFromDBModels(dbAssessments []db.Assessment) []Assessment {
	assessments := make([]Assessment, 0, len(dbAssessments))
	for _, a := range dbAssessments {
		assessments = append(assessments, Assessment{
			ID:                    a.ID,
			CourseParticipationID: a.CourseParticipationID,
			CoursePhaseID:         a.CoursePhaseID,
			CompetencyID:          a.CompetencyID,
			Score:                 a.Score,
			Comment:               a.Comment.String,
			AssessedAt:            a.AssessedAt.Time,
		})
	}
	return assessments
}
