import { assessmentAxiosInstance } from '../assessmentServerConfig'

interface CreateCategoryRequest {
  name: string
  description?: string
}

interface CategoryResponse {
  id: string
  name: string
  description?: string
}

export const createCategory = async (
  coursePhaseID: string,
  category: CreateCategoryRequest,
): Promise<CategoryResponse> => {
  try {
    const response = await assessmentAxiosInstance.post<CategoryResponse>(
      `/${coursePhaseID}/category`,
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
