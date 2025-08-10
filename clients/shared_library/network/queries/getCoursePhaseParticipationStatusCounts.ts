import { axiosInstance } from '@/network/configService'

export interface CoursePhaseParticipationStatusCounts {
  [key: string]: number
}

export const getCoursePhaseParticipationStatusCounts = async (
  phaseId: string,
): Promise<CoursePhaseParticipationStatusCounts> => {
  try {
    const data: CoursePhaseParticipationStatusCounts = (
      await axiosInstance.get(`/api/course_phases/${phaseId}/participation_status_counts`)
    ).data
    return data
  } catch (err) {
    console.error(err)
    throw err
  }
}
