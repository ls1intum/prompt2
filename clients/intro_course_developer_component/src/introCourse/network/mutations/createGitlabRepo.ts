import { GitlabRepoRequest } from '../../interfaces/GitlabRepoRequest'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const createGitlabRepo = async (
  coursePhaseID: string,
  courseParticipationID: string,
  createGitlabRepoDTO: GitlabRepoRequest,
): Promise<any> => {
  try {
    const response = await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/infrastructure/gitlab/student-setup/${courseParticipationID}`,
      createGitlabRepoDTO,
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
