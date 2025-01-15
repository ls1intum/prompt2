package courseDTO

import "github.com/google/uuid"

type MetaDataGraphItem struct {
	FromCoursePhaseID uuid.UUID `json:"from_course_phase_id"`
	ToCoursePhaseID   uuid.UUID `json:"to_course_phase_id"`
}
