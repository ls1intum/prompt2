import { CreateCoursePhase } from '@/interfaces/course_phase'
import { axiosInstance } from '../configService'

export const postNewCoursePhase = async (
  coursePhase: CreateCoursePhase,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.post(`/api/course_phases/course/${coursePhase.course_id}`, coursePhase, {
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
