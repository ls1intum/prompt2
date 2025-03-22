import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const createRepository = async (
  gitHubHandle: string,
  coursePhaseID: string,
): Promise<string> => {
  try {
    interface RepositoryResponse {
      message: string
      repositoryUrl: string
    }

    const payload = {
      GithubUsername: gitHubHandle,
      StudentId: 'ge63sir', //TODO: remove once Challenge server is updated
    }

    const response = await devOpsChallengeAxiosInstance.post<RepositoryResponse>(
      `${coursePhaseID}/repository`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )

    return response.data.repositoryUrl
  } catch (err) {
    console.error(err)
    throw err
  }
}
