import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteAssessmentCompletion = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/course-participation/${courseParticipationID}`,
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
