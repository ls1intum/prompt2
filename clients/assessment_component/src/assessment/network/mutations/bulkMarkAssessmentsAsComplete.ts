import { assessmentAxiosInstance } from '../assessmentServerConfig'

export interface BulkMarkAssessmentAsCompleteRequest {
  courseParticipationIDs: string[]
  author: string
}

export const bulkMarkAssessmentsAsComplete = async (
  coursePhaseID: string,
  request: BulkMarkAssessmentAsCompleteRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/bulk-mark-complete`,
      request,
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
