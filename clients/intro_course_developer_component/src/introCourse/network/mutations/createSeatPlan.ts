import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const createSeatPlan = async (coursePhaseID: string, seatNames: string[]): Promise<void> => {
  try {
    await introCourseAxiosInstance.post(
      `intro-course/api/course_phase/${coursePhaseID}/seat_plan`,
      seatNames,
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
