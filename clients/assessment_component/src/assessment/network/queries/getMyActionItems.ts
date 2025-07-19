import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { ActionItem } from '../../interfaces/actionItem'

export const getMyActionItems = async (coursePhaseID: string): Promise<ActionItem[]> => {
  const response = await assessmentAxiosInstance.get<ActionItem[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/action-item/my-action-items`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
