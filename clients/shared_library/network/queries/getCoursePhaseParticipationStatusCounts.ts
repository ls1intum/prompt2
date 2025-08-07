import { axiosInstance } from '@/network/configService'

export interface CoursePhaseParticipationStatusCounts {
    [key: string]: number
}

type CoursePhaseParticipationStatusCountsResponse = {
    pass_status: { pass_status: string, valid: boolean },
    count: number
}[]

const transformStatusCounts = (data: CoursePhaseParticipationStatusCountsResponse): CoursePhaseParticipationStatusCounts => {
  return data.reduce((acc, curr) => {
    const statusKey = curr.pass_status.pass_status
    acc[statusKey] = curr.count
    return acc
  }, {} as CoursePhaseParticipationStatusCounts)
}

export const getCoursePhaseParticipationStatusCounts = async (phaseId: string): Promise<CoursePhaseParticipationStatusCounts> => {
  try {
    let data: CoursePhaseParticipationStatusCountsResponse = (await axiosInstance.get(`/api/course_phases/${phaseId}/participation_status_counts`)).data
    return transformStatusCounts(data)
  } catch (err) {
    console.error(err)
    throw err
  }
}
