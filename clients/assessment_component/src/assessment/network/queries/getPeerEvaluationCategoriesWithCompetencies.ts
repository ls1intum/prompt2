import { CategoryWithCompetencies } from '../../interfaces/category'
import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getPeerEvaluationCategoriesWithCompetencies = async (
  coursePhaseID: string,
): Promise<CategoryWithCompetencies[]> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/category/peer/with-competencies`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
