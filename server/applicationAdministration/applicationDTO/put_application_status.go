package applicationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type PutApplicationStatus struct {
	PassStatus                  db.PassStatus `json:"pass_status"`
	CoursePhaseParticipationIDs []uuid.UUID   `json:"course_phase_participation_ids"`
}
