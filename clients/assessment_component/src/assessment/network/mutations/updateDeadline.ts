import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const updateDeadline = async (coursePhaseID: string, deadline: Date): Promise<void> => {
  try {
    await assessmentAxiosInstance.put(
      `assessment/api/course_phase/${coursePhaseID}/config/deadline`,
      { deadline: deadline },
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
