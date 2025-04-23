package assessmentDTO

import (
	"time"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type CreateOrUpdateAssessmentRequest struct {
	CourseParticipationID uuid.UUID     `json:"courseParticipationID"`
	CoursePhaseID         uuid.UUID     `json:"coursePhaseID"`
	CompetencyID          uuid.UUID     `json:"competencyID"`
	Score                 db.ScoreLevel `json:"score"`
	Comment               string        `json:"comment"`
	AssessedAt            *time.Time    `json:"assessedAt,omitempty"`
	Author                string        `json:"author"`
}
