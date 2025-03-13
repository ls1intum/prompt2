import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const deleteSeatPlan = async (coursePhaseID: string): Promise<void> => {
  try {
    await introCourseAxiosInstance.delete(
      `intro-course/api/course_phase/${coursePhaseID}/seat_plan`,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
