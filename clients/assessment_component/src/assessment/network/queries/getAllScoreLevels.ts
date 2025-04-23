import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { ScoreLevelWithParticipation } from '../../interfaces/scoreLevelWithParticipation'

export const getAllScoreLevels = async (
  coursePhaseID: string,
): Promise<ScoreLevelWithParticipation[]> => {
  const response = await assessmentAxiosInstance.get<ScoreLevelWithParticipation[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/scoreLevel`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
