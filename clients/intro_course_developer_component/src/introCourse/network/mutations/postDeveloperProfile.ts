import { PostDeveloperProfile } from '../../interfaces/PostDeveloperProfile'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const postDeveloperProfile = async (
  coursePhaseID: string,
  developerProfile: PostDeveloperProfile,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/developer_profile`,
      developerProfile,
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
