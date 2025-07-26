import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { EvaluationCompletion } from '../../interfaces/evaluationCompletion'

export const getAllPeerEvaluationCompletionsInPhase = async (
  coursePhaseID: string,
): Promise<EvaluationCompletion[]> => {
  const response = await assessmentAxiosInstance.get<EvaluationCompletion[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/completed/peer`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
