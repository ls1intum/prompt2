import { EvaluationCompletion } from '../../interfaces/evaluationCompletion'
import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getMyPeerEvaluationCompletions = async (
  coursePhaseID: string,
): Promise<EvaluationCompletion[]> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/evaluation/completed/my-completion/peer`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
