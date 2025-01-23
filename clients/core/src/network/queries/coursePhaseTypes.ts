import { axiosInstance } from '@/network/configService'
import { CoursePhaseType } from '@/interfaces/course_phase_type'

export const getAllCoursePhaseTypes = async (): Promise<CoursePhaseType[]> => {
  try {
    return (await axiosInstance.get(`/api/course_phase_types`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
