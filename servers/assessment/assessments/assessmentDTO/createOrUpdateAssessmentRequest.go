package assessmentDTO

import (
	"time"

	"github.com/google/uuid"
)

type CreateOrUpdateAssessmentRequest struct {
	CourseParticipationID uuid.UUID  `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID  `json:"coursePhaseID"`
	CompetencyID          uuid.UUID  `json:"competencyID"`
	Score                 int16      `json:"score"`
	Comment               string     `json:"comment"`
	AssessedAt            *time.Time `json:"assessedAt,omitempty"`
}
