import { CoursePhase } from './course_phase'

export interface Course {
  id: string
  name: string
  start_date: Date
  end_date: Date
  course_type: string
  ects: number
  semester_tag: string
  meta_data: Array<JSON>
  course_phases: Array<CoursePhase>
}
