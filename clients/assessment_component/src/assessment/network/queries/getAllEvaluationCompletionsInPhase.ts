import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { EvaluationCompletion } from '../../interfaces/evaluationCompletion'

export const getAllEvaluationCompletionsInPhase = async (
  coursePhaseID: string,
): Promise<EvaluationCompletion[]> => {
  const response = await assessmentAxiosInstance.get<EvaluationCompletion[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/completed`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
