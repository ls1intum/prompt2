import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getOwnDeveloperProfile = async (coursePhaseID: string): Promise<DeveloperProfile> => {
  try {
    return (
      await introCourseAxiosInstance.get(
        `intro-course/api/course_phase/${coursePhaseID}/developer_profile/self`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
