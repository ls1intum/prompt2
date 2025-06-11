import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateAssessmentTemplateRequest } from '../../interfaces/assessmentTemplate'

export const createAssessmentTemplate = async (
  coursePhaseID: string,
  request: CreateAssessmentTemplateRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/assessment-template`,
      request,
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
