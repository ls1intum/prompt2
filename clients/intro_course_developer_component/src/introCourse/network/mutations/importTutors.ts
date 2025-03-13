import { Student } from '@tumaet/prompt-shared-state'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const importTutors = async (
  coursePhaseID: string,
  courseID: string,
  tutors: Student[],
): Promise<void> => {
  try {
    await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/tutor/course/${courseID}`,
      tutors,
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
