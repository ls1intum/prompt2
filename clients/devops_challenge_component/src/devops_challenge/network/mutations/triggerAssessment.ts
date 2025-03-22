import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const triggerAssessment = async (
  gitHubHandle: string,
  coursePhaseID: string,
): Promise<string> => {
  try {
    const payload = {
      GithubUsername: gitHubHandle,
      StudentId: 'ge63sir', //TODO: remove once Challenge server is updated
    }

    const response = await devOpsChallengeAxiosInstance.post(
      `${coursePhaseID}/studentTest`,
      payload,
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
