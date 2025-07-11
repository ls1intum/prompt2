import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateEvaluationRequest } from '../../interfaces/evaluation'

export const createOrUpdateEvaluation = async (
  coursePhaseID: string,
  evaluation: CreateOrUpdateEvaluationRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post<void>(
      `assessment/api/course_phase/${coursePhaseID}/evaluation`,
      evaluation,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error('Failed to create or update evaluation:', err)
    throw err
  }
}
