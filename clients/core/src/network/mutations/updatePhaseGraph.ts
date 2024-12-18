import { axiosInstance } from '../configService'
import { CoursePhaseGraphUpdate } from '@/interfaces/course_phase_graph'

export const updatePhaseGraph = async (
  courseID: string,
  coursePhaseGraphUpdate: CoursePhaseGraphUpdate,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.put(`/api/courses/${courseID}/phase_graph`, coursePhaseGraphUpdate, {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      })
    ).data.id // try to get the id of the created course
  } catch (err) {
    console.error(err)
    throw err
  }
}
