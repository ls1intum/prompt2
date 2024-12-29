import { Student } from './student'

export interface CoursePhaseParticipationWithStudent {
  id: string
  passed: boolean
  meta_data: { [key: string]: any }
  student: Student
}
