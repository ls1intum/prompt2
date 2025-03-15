import { Seat } from '../../interfaces/Seat'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const updateSeatPlan = async (coursePhaseID: string, seats: Seat[]): Promise<void> => {
  try {
    await introCourseAxiosInstance.put(
      `intro-course/api/course_phase/${coursePhaseID}/seat_plan`,
      seats,
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
