import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateAssessmentTemplateCoursePhaseRequest } from '../../interfaces/assessmentTemplate'

export const createOrUpdateAssessmentTemplateCoursePhase = async (
  request: CreateOrUpdateAssessmentTemplateCoursePhaseRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.put(
      `assessment/api/course_phase/${request.coursePhaseID}/assessment-template`,
      {
        assessmentTemplateID: request.assessmentTemplateID,
      },
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
