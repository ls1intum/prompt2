import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Category, CreateCategoryRequest } from '../../interfaces/category'

export const createCategory = async (
  coursePhaseID: string,
  category: CreateCategoryRequest,
): Promise<Category> => {
  try {
    const response = await assessmentAxiosInstance.post<Category>(
      `assessment/api/course_phase/${coursePhaseID}/category`,
      category,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
