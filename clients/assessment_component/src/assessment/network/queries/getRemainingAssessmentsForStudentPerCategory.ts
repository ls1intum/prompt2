import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CategoryWithRemainingAssessments } from '../../interfaces/category'

export const getRemainingAssessmentsForStudentPerCategory = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<CategoryWithRemainingAssessments[]> => {
  const response = await assessmentAxiosInstance.get<CategoryWithRemainingAssessments[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/remaining/${courseParticipationID}/per-category`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
