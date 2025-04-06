import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getRemainingAssessmentsForStudent = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<number> => {
  const response = await assessmentAxiosInstance.get<{ remainingAssessments: number }>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/remaining/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data.remainingAssessments
}
