import { GitlabCourseInfrastructureRequest } from '../../interfaces/GitlabCourseInfrastructureRequest'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const createIntroCourseGitlabInfrastructure = async (
  coursePhaseID: string,
  request: GitlabCourseInfrastructureRequest,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/infrastructure/gitlab/course-setup`,
      request,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
  } catch (err: any) {
    console.error(err)
    if (err.response && err.response.data && err.response.data.error) {
      throw err.response.data.error
    }
    throw err
  }
}
