import { CategoryWithCompetencies } from '../../interfaces/category'
import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getSelfEvaluationCategoriesWithCompetencies = async (
  coursePhaseID: string,
): Promise<CategoryWithCompetencies[]> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/category/self/with-competencies`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
