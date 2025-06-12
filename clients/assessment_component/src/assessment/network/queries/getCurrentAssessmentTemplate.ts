import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentTemplate } from '../../interfaces/assessmentTemplate'

export const getCurrentAssessmentTemplate = async (
  coursePhaseID: string,
): Promise<AssessmentTemplate> => {
  const response = await assessmentAxiosInstance.get<AssessmentTemplate>(
    `assessment/api/course_phase/${coursePhaseID}/assessment-template/current`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
