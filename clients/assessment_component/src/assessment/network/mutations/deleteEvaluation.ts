import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteEvaluation = async (
  coursePhaseID: string,
  evaluationID: string,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.delete<void>(
      `assessment/api/course_phase/${coursePhaseID}/evaluation/${evaluationID}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error('Failed to delete evaluation:', err)
    throw err
  }
}
