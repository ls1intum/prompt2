package courseDTO

import "github.com/google/uuid"

type CoursePhaseGraph struct {
	FromCoursePhaseID uuid.UUID `json:"from_course_phase_id"`
	ToCoursePhaseID   uuid.UUID `json:"to_course_phase_id"`
}

type UpdateCoursePhaseGraph struct {
	InitialPhase uuid.UUID          `json:"initial_phase"`
	PhaseGraph   []CoursePhaseGraph `json:"course_phase_graph"`
}
