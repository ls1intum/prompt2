import { axiosInstance } from '@/network/configService'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

export const getOwnCoursePhaseParticipation = async (
  coursePhaseID: string,
): Promise<CoursePhaseParticipationWithStudent> => {
  try {
    return (await axiosInstance.get(`/api/course_phases/${coursePhaseID}/participations/self`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
