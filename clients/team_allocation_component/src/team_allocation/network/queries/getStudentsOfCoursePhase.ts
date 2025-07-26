import { axiosInstance } from '@/network/configService'
import { Student } from '@tumaet/prompt-shared-state'

export const getStudentsOfCoursePhase = async (coursePhaseID: string): Promise<Student[]> => {
  try {
    return (await axiosInstance.get(`/api/course_phases/${coursePhaseID}/participations/students`))
      .data
  } catch (err) {
    console.error(err)
    throw err
  }
}
