import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Evaluation } from '../../interfaces/evaluation'

export const getEvaluationsForTutorInPhase = async (
  coursePhaseID: string,
  tutorParticipationID: string,
): Promise<Evaluation[]> => {
  const response = await assessmentAxiosInstance.get<Evaluation[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/tutor/${tutorParticipationID}`,
  )
  return response.data
}
