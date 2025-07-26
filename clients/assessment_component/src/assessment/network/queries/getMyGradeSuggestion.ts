import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getMyGradeSuggestion = async (coursePhaseID: string): Promise<number | undefined> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/my-grade-suggestion`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
