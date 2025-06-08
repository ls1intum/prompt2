import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { ActionItem } from '../../interfaces/actionItem'

export const getAllActionItemsForStudentInPhase = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<ActionItem[]> => {
  const response = await assessmentAxiosInstance.get<ActionItem[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/action-item/course-participation/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
