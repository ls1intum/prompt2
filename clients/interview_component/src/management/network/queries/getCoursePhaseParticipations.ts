import { axiosInstance } from '@/network/configService'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

export const getCoursePhaseParticipations = async (
  coursePhaseID: string,
): Promise<CoursePhaseParticipationWithStudent[]> => {
  try {
    return (await axiosInstance.get(`/api/course_phases/${coursePhaseID}/participations`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
