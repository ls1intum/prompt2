import { RemainingAssessmentsForStudent } from '../../interfaces/assessment'
import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getRemainingAssessmentsForStudent = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<RemainingAssessmentsForStudent> => {
  const response = await assessmentAxiosInstance.get<RemainingAssessmentsForStudent>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/remaining/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
