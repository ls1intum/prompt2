import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Category } from '../../interfaces/category'

export const getAllCategories = async (coursePhaseID: string): Promise<Category[]> => {
  const response = await assessmentAxiosInstance.get<Category[]>(
    `assessment/api/course_phase/${coursePhaseID}/category`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
