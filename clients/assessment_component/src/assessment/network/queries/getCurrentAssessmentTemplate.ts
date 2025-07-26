import { AssessmentTemplate } from '../../interfaces/assessmentTemplate'
import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getCurrentAssessmentTemplate = async (
  coursePhaseID: string,
): Promise<AssessmentTemplate> => {
  try {
    return (
      await assessmentAxiosInstance.get(
        `assessment/api/course_phase/${coursePhaseID}/assessment-template/current`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
