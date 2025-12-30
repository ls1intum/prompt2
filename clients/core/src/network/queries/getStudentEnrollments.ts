import { axiosInstance } from '@/network/configService'
import { Gender, PassStatus, StudyDegree } from '@tumaet/prompt-shared-state'

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
  id: string
  firstName: string
  lastName: string
  email: string
  matriculationNumber: string
  universityLogin: string
  hasUniversityAccount: boolean
  gender: Gender
  nationality: string
  studyProgram: string
  studyDegree: StudyDegree
  currentSemester: number | null
  courses: CourseEnrollment[]
}

export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollments> => {
  try {
    const d = (
      await axiosInstance.get(`/api/students/${studentId}/enrollments`, {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data

    console.log(d)

    return d
  } catch (err) {
    console.error(err)
    throw err
  }
}
