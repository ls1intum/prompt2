import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getAllDeveloperProfiles = async (
  coursePhaseID: string,
): Promise<DeveloperProfile[]> => {
  try {
    return (
      await introCourseAxiosInstance.get(
        `intro-course/api/course_phase/${coursePhaseID}/developer_profile`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
