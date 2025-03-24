import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

interface RepositoryResponse {
  message: string
  repositoryUrl: string
}

export const createRepository = async (
  githubUsername: string,
  coursePhaseID: string,
): Promise<string> => {
  try {
    const payload = {
      GithubUsername: githubUsername,
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
