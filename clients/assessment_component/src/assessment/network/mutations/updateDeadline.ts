import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { UpdateDeadlineRequest } from '../../interfaces/deadline'

export const updateDeadline = async (
  coursePhaseID: string,
  request: UpdateDeadlineRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.put(
      `assessment/api/course_phase/${coursePhaseID}/deadline`,
      request,
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
