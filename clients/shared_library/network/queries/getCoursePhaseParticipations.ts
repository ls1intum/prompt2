import { axiosInstance } from '@/network/configService'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'

export const getCoursePhaseParticipations = async (
  coursePhaseID: string,
): Promise<CoursePhaseParticipationsWithResolution> => {
  try {
    return (await axiosInstance.get(`/api/course_phases/${coursePhaseID}/participations`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
