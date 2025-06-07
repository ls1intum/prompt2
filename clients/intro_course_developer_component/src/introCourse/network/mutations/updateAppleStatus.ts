import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const updateAppleStatusCreated = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.put(
      `intro-course/api/course_phase/${coursePhaseID}/developer_account/${courseParticipationID}/manual`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
