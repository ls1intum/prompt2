import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getRemainingAssessmentsForStudentInCategory = async (
  coursePhaseID: string,
  courseParticipationID: string,
  categoryID: string,
): Promise<number> => {
  const response = await assessmentAxiosInstance.get<{ remainingAssessments: number }>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/remaining/${courseParticipationID}/category/${categoryID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data.remainingAssessments
}
