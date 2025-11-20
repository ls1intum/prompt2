import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentSchema } from '../../interfaces/assessmentSchema'

export const getAllAssessmentSchemas = async (
  coursePhaseID: string,
): Promise<AssessmentSchema[]> => {
  const { data } = await assessmentAxiosInstance.get<AssessmentSchema[]>(
    `assessment/api/course_phase/${coursePhaseID}/assessment-schema`,
  )
  return data
}
