export interface CoursePhaseGraphItem {
  from_course_phase_id: string
  to_course_phase_id: string
}

export interface CoursePhaseGraphUpdate {
  initial_phase: string
  course_phase_graph: CoursePhaseGraphItem[]
}
