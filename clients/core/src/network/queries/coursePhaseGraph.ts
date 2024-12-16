import { axiosInstance } from '../configService'
import { CoursePhaseGraphItem } from '@/interfaces/course_phase_graph'

export const getCoursePhaseGraph = async (course_id: string): Promise<CoursePhaseGraphItem[]> => {
  try {
    return (await axiosInstance.get(`/api/courses/${course_id}/phase_graph`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
