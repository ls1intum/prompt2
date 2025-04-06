import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Assessment, CreateOrUpdateAssessmentRequest } from '../../interfaces/assessment'

export const updateAssessment = async (
  assessment: CreateOrUpdateAssessmentRequest,
): Promise<Assessment> => {
  try {
    const response = await assessmentAxiosInstance.put<Assessment>(
      `assessment/api/course_phase/${assessment.coursePhaseID}/student-assessment`,
      assessment,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
