import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteActionItem = async (
  coursePhaseID: string,
  actionItemID: string,
): Promise<void> => {
  try {
    return await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/action-item/${actionItemID}`,
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
