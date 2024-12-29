import { Student } from './student'

export enum pass_status {
  PASSED = 'passed',
  FAILED = 'failed',
  NOT_ASSESSED = 'not_assessed',
}

export interface CoursePhaseParticipationWithStudent {
  id: string
  pass_status: pass_status
  meta_data: { [key: string]: any }
  student: Student
}
