import { SeatAssignment } from '../../pages/SeatAssignment/interfaces/SeatAssignment'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getOwnSeatPlanAssignment = async (coursePhaseID: string): Promise<SeatAssignment> => {
  try {
    return (
      await introCourseAxiosInstance.get(
        `intro-course/api/course_phase/${coursePhaseID}/seat_plan/own-assignment`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
