import { CourseType } from './course_type'

export interface OpenApplication {
  id: string
  courseName: string
  courseType: CourseType
  ects: number
  startDate: Date
  endDate: Date
  applicationDeadline: Date
}
