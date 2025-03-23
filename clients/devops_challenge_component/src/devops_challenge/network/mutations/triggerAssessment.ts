import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const triggerAssessment = async (
  gitHubHandle: string,
  coursePhaseID: string,
): Promise<string> => {
  try {
    const response = await devOpsChallengeAxiosInstance.post<string>(
      `${coursePhaseID}/studentTest`,
      gitHubHandle,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )

    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
