import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Assessment, CreateOrUpdateAssessmentRequest } from '../../interfaces/assessment'

const assessmentOperation = async (
  method: 'post' | 'put',
  assessment: CreateOrUpdateAssessmentRequest,
): Promise<void> => {
  try {
    if (!assessment.coursePhaseID) {
      throw new Error('coursePhaseID is required')
    }
    await assessmentAxiosInstance[method]<Assessment>(
      `assessment/api/course_phase/${assessment.coursePhaseID}/student-assessment`,
      assessment,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      },
    )
  } catch (err) {
    console.error(`Failed to ${method === 'post' ? 'create' : 'update'} assessment:`, err)
    throw err
  }
}

export const createAssessment = async (
  assessment: CreateOrUpdateAssessmentRequest,
): Promise<void> => {
  await assessmentOperation('post', assessment)
}

export const updateAssessment = async (
  assessment: CreateOrUpdateAssessmentRequest,
): Promise<void> => {
  await assessmentOperation('put', assessment)
}
