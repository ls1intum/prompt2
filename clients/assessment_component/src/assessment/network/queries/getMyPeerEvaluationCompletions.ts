import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { EvaluationCompletion } from '../../interfaces/evaluationCompletion'

export const getMyPeerEvaluationCompletions = async (
  coursePhaseID: string,
): Promise<EvaluationCompletion[]> => {
  const response = await assessmentAxiosInstance.get<EvaluationCompletion[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/completed/my-completion/peer`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return [
    ...response.data,
    {
      courseParticipationID: 'mockCourseParticipationID',
      coursePhaseID: coursePhaseID,
      completedAt: new Date().toISOString(),
      completed: true,
      authorCourseParticipationID: 'mockAuthorCourseParticipationID',
    },
  ]
}
