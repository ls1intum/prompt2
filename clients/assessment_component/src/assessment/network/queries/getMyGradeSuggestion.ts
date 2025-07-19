import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getMyGradeSuggestion = async (coursePhaseID: string): Promise<number | undefined> => {
  const response = await assessmentAxiosInstance.get<number>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/my-grade-suggestion`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
