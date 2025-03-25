import { DeveloperWithInfo } from '../../interfaces/DeveloperWithInfo'
import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

interface StudentResponse {
  CourseParticipationId: string
  GithubUsername: string
  Attempts: number
  Passed: boolean
}

export const getAllDeveloperProfiles = async (
  coursePhaseID: string,
): Promise<DeveloperWithInfo[]> => {
  try {
    const students = (await devOpsChallengeAxiosInstance.get(`/${coursePhaseID}/students`)).data
      .students

    return students.map((student: StudentResponse) => ({
      courseParticipationID: student.CourseParticipationId,
      attempts: student.Attempts,
      hasPassed: student.Passed,
    }))
  } catch (err) {
    console.error(err)
    throw err
  }
}
