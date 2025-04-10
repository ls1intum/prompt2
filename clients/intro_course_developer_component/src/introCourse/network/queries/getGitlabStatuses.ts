import { GitlabStatus } from '../../interfaces/GitlabStatus'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getGitlabStatuses = async (coursePhaseID: string): Promise<GitlabStatus[]> => {
  try {
    return (
      await introCourseAxiosInstance.get(
        `intro-course/api/course_phase/${coursePhaseID}/infrastructure/gitlab/student-setup`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
