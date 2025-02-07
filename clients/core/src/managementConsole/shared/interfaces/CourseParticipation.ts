export interface CourseParticipation {
  isStudentOfCourse: boolean
  id: string
  courseID: string
  studentID: string
  activeCoursePhases: string[]
}
