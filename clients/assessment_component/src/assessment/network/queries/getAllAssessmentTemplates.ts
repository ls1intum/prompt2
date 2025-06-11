import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentTemplate } from '../../interfaces/assessmentTemplate'

export const getAllAssessmentTemplates = async (
  coursePhaseID: string,
): Promise<AssessmentTemplate[]> => {
  const { data } = await assessmentAxiosInstance.get<AssessmentTemplate[]>(
    `assessment/api/course_phase/${coursePhaseID}/assessment-template`,
  )
  return data
}
