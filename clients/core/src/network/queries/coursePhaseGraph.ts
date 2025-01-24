import { axiosInstance } from '@/network/configService'
import { CoursePhaseGraphItem } from '../../CourseConfigurator/interfaces/coursePhaseGraphItem'

export const getCoursePhaseGraph = async (courseID: string): Promise<CoursePhaseGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${courseID}/phase_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
