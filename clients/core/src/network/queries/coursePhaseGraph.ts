import { axiosInstance } from '@/network/configService'
import { CoursePhaseGraphItem } from '../../CourseConfigurator/interfaces/coursePhaseGraphItem'

export const getCoursePhaseGraph = async (course_id: string): Promise<CoursePhaseGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${course_id}/phase_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
