import { axiosInstance } from '@/network/configService'
import { PassStatus } from '@tumaet/prompt-shared-state'

export interface CoursePhaseType {
  id: string
  name: string
}

export interface CoursePhaseEnrollment {
  coursePhaseId: string
  name: string
  isInitialPhase: boolean
  coursePhaseType: CoursePhaseType
  passStatus: PassStatus
  lastModified: string | null
}

export interface CourseEnrollment {
  courseId: string
  courseParticipationId: string
  studentReadableData: object
  name: string
  semesterTag: string
  courseType: string
  ects: number
  startDate: string | null
  endDate: string | null
  longDescription: string | null
  coursePhases: CoursePhaseEnrollment[]
}

export interface StudentEnrollments {
  courses: CourseEnrollment[]
}

export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollments> => {
  try {
    return (
      await axiosInstance.get(`/api/students/${studentId}/enrollments`, {
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
