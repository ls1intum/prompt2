import { assessmentAxiosInstance } from '../assessmentServerConfig'

export interface SchemaAssessmentDataResponse {
  hasAssessmentData: boolean
}

export const getSchemaHasAssessmentData = async (
  schemaID: string,
  coursePhaseID: string,
): Promise<SchemaAssessmentDataResponse> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/assessment-schema/${schemaID}/has-assessment-data`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
