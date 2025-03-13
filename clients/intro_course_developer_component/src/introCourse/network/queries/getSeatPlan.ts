import { Seat } from 'src/introCourse/interfaces/Seat'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getSeatPlan = async (coursePhaseID: string): Promise<Seat[]> => {
  try {
    return (
      await introCourseAxiosInstance.get(`intro-course/api/course_phase/${coursePhaseID}/seat_plan`)
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
