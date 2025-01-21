import { CourseType } from './course_type'

export interface OpenApplicationDetails {
  id: string
  courseName: string
  courseType: CourseType
  ects: number
  startDate: Date
  endDate: Date
  applicationDeadline: Date
  externalStudentsAllowed: boolean
  universityLoginAvailable: boolean
}
