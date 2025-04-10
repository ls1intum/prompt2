import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const getAllCategoriesWithCompetencies = async (
  coursePhaseID: string,
): Promise<CategoryWithCompetencies[]> => {
  const response = await assessmentAxiosInstance.get<CategoryWithCompetencies[]>(
    `assessment/api/course_phase/${coursePhaseID}/category/with-competencies`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
