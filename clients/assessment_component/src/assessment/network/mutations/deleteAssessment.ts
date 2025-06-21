import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteAssessment = async (
  coursePhaseID: string,
  assessmentID: string,
): Promise<void> => {
  try {
    return await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/${assessmentID}`,
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
