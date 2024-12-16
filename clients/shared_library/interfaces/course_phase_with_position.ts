export interface CoursePhasePosition {
  id?: string
  course_id: string
  name: string
  meta_data: Array<JSON>
  is_initial_phase: boolean
  course_phase_type_id: string
  position: { x: number; y: number }
}
