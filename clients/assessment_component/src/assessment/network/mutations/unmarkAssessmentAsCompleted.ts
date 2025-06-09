import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const unmarkAssessmentAsCompleted = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.put(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/course-participation/${courseParticipationID}/unmark`,
      {},
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
