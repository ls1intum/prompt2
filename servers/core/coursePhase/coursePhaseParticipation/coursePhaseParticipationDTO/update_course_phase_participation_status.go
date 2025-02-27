package coursePhaseParticipationDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type UpdateCoursePhaseParticipationStatus struct {
	PassStatus             db.PassStatus `json:"passStatus"`
	CourseParticipationIDs []uuid.UUID   `json:"courseParticipationIDs"`
}
