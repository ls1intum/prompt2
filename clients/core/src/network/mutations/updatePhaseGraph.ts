import { axiosInstance } from '../configService'
import { CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'

export const updatePhaseGraph = async (
  courseID: string,
  coursePhaseGraphUpdate: CoursePhaseGraphUpdate,
): Promise<void> => {
  try {
    return await axiosInstance.put(`/api/courses/${courseID}/phase_graph`, coursePhaseGraphUpdate, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
