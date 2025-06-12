import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { ActionItem, UpdateActionItemRequest } from '../../interfaces/actionItem'

export const updateActionItem = async (
  coursePhaseID: string,
  actionItem: UpdateActionItemRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.put<ActionItem>(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/action-item/${actionItem.id}`,
      actionItem,
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
