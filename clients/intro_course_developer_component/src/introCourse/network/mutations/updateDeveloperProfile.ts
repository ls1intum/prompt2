import { PostDeveloperProfile } from '../../interfaces/PostDeveloperProfile'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const updateDeveloperProfile = async (
  coursePhaseID: string,
  courseParticipationID: string,
  developerProfile: PostDeveloperProfile,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.put(
      `intro-course/api/course_phase/${coursePhaseID}/developer_profile/${courseParticipationID}`,
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
