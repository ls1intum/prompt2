import { Student } from './student'

export enum PassStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  NOT_ASSESSED = 'not_assessed',
}

export interface CoursePhaseParticipationWithStudent {
  id: string
  pass_status: PassStatus
  course_participation_id: string
  meta_data: { [key: string]: any }
  prev_meta_data: { [key: string]: any }
  student: Student
}

export interface UpdateCoursePhaseParticipation {
  id: string
  course_phase_id: string
  course_participation_id: string
  pass_status?: PassStatus
  meta_data: { [key: string]: any }
}
