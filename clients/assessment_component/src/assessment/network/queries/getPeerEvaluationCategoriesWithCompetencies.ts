import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const getPeerEvaluationCategoriesWithCompetencies = async (
  coursePhaseID: string,
): Promise<CategoryWithCompetencies[]> => {
  const response = await assessmentAxiosInstance.get<CategoryWithCompetencies[]>(
    `assessment/api/course_phase/${coursePhaseID}/category/peer/with-competencies`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
