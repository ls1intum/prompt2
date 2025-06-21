import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateAssessmentTemplateCoursePhaseRequest } from '../../interfaces/assessmentTemplate'

export const createOrUpdateAssessmentTemplateCoursePhase = async (
  request: CreateOrUpdateAssessmentTemplateCoursePhaseRequest,
): Promise<void> => {
  await assessmentAxiosInstance.post(
    `assessment/api/course_phase/${request.coursePhaseID}/assessment-template/course-phase`,
    request,
  )
}
