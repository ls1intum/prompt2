import { axiosInstance } from '@/network/configService'
import { CoursePhaseType } from '@tumaet/prompt-shared-state'

export const getAllCoursePhaseTypes = async (): Promise<CoursePhaseType[]> => {
  try {
    return (await axiosInstance.get(`/api/course_phase_types`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
