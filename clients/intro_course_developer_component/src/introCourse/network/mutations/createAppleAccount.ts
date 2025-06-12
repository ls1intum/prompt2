import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const createAppleAccount = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<any> => {
  try {
    const response = await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/developer_account/invite/${courseParticipationID}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
    return response.data
  } catch (err: any) {
    console.error(err)
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error
    }
    throw err
  }
}
