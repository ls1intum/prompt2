import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateAssessmentSchemaCoursePhaseRequest } from '../../interfaces/assessmentSchema'

export const createOrUpdateAssessmentSchemaCoursePhase = async (
  request: CreateOrUpdateAssessmentSchemaCoursePhaseRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.put(
      `assessment/api/course_phase/${request.coursePhaseID}/assessment-schema`,
      {
        assessmentSchemaID: request.assessmentSchemaID,
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
