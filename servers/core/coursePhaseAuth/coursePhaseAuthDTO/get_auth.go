package coursePhaseAuthDTO

import "github.com/google/uuid"

type GetCoursePhaseAuthRoles struct {
	Roles                      []string  `json:"roles"`
	CoursePhaseParticipationID uuid.UUID `json:"coursePhaseParticipationID"`
	CourseParticipationID      uuid.UUID `json:"courseParticipationID"`
}
