import { axiosInstance } from '@/network/configService'

export interface StudentCourseParticipation {
  courseId: string
  courseName: string
  studentReadableData: object
}

export interface StudentWithCourses {
  id: string
  name: string
  currentSemester: number | null
  studyProgram: string
  courses: StudentCourseParticipation[]
}

export const getStudentsWithCourses = async (): Promise<StudentWithCourses[]> => {
  try {
    return (
      await axiosInstance.get('/api/students/with-courses', {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
