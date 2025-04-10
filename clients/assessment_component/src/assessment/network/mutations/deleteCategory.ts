import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteCategory = async (coursePhaseID: string, categoryID: string): Promise<void> => {
  try {
    return await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/category/${categoryID}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
