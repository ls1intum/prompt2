import { axiosInstance } from '@/network/configService'
import { CoursePhaseWithMetaData } from '@/interfaces/course_phase'

export const getCoursePhaseByID = async (phaseId: string): Promise<CoursePhaseWithMetaData> => {
  try {
    return (await axiosInstance.get(`/api/course_phases/${phaseId}`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
