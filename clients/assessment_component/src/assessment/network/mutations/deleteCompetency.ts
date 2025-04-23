import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteCompetency = async (
  coursePhaseID: string,
  competencyID: string,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/competency/${competencyID}`,
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
