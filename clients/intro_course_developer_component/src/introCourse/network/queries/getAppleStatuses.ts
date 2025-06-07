import { AppleStatus } from '../../interfaces/AppleStatus'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getAppleStatuses = async (coursePhaseID: string): Promise<AppleStatus[]> => {
  try {
    return (
      await introCourseAxiosInstance.get(
        `intro-course/api/course_phase/${coursePhaseID}/developer_account/status`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
