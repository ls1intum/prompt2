import { UpdateTutor } from '../../interfaces/UpdateTutor'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const updateTutorGitLabUsername = async (
  coursePhaseID: string,
  tutorID: string,
  updateTutorDTO: UpdateTutor,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.put(
      `intro-course/api/course_phase/${coursePhaseID}/tutor/${tutorID}`,
      updateTutorDTO,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
