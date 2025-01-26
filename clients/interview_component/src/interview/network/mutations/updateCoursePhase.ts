import { UpdateCoursePhase } from '@tumaet/prompt-shared-state'
import { axiosInstance } from '@/network/configService'

export const updateCoursePhase = async (
  coursePhase: UpdateCoursePhase,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.put(`/api/course_phases/${coursePhase.id}`, coursePhase, {
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
