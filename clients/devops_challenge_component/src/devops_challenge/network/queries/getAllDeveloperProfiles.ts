import { DeveloperWithInfo } from '../../interfaces/DeveloperWithInfo'
import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const getAllDeveloperProfiles = async (
  coursePhaseID: string,
): Promise<DeveloperWithInfo[]> => {
  try {
    let students = (await devOpsChallengeAxiosInstance.get(`/${coursePhaseID}/students`)).data
      .students

    return students.map((student: any) => ({
      courseParticipationID: student.CourseParticipationId,
      githubUsername: student.GithubUsername,
      repositoryURL: student.Repository,
      attempts: student.Attempts,
      hasPassed: student.Passed,
    }))
  } catch (err) {
    console.error(err)
    throw err
  }
}
