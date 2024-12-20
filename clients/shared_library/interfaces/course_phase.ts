export interface CoursePhase {
  id: string
  course_id: string
  name: string
  //meta_data: Array<JSON> This DTO is used for getting all courses
  // in all courses we do not send the phase meta data
  is_initial_phase: boolean
  sequence_order: number
  course_phase_type_id: string
  course_phase_type: string
}

export interface CreateCoursePhase {
  course_id: string
  name: string
  is_initial_phase: boolean
  course_phase_type_id: string
}

export interface UpdateCoursePhase {
  id: string
  name: string
}

export interface CoursePhaseWithMetaData {
  id: string
  course_id: string
  name: string
  meta_data: Array<JSON>
  is_initial_phase: boolean
  course_phase_type_id: string
}
