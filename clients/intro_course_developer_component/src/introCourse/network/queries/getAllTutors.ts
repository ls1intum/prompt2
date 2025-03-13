import { Tutor } from '../../interfaces/Tutor'
import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const getAllTutors = async (coursePhaseID: string): Promise<Tutor[]> => {
  try {
    return (
      await introCourseAxiosInstance.get(`intro-course/api/course_phase/${coursePhaseID}/tutor`)
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
