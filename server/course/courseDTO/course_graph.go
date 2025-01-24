package courseDTO

import "github.com/google/uuid"

type CoursePhaseGraph struct {
	FromCoursePhaseID uuid.UUID `json:"fromCoursePhaseID"`
	ToCoursePhaseID   uuid.UUID `json:"toCoursePhaseID"`
}

type UpdateCoursePhaseGraph struct {
	InitialPhase uuid.UUID          `json:"initialPhase"`
	PhaseGraph   []CoursePhaseGraph `json:"coursePhaseGraph"`
}
