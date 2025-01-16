import { Student } from './student'

export enum PassStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  NOT_ASSESSED = 'not_assessed',
}

export interface CoursePhaseParticipationWithStudent {
  id: string
  pass_status: PassStatus
  meta_data: { [key: string]: any }
  prev_meta_data: { [key: string]: any }
  student: Student
}
