import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CoursePhaseConfig } from '../../interfaces/coursePhaseConfig'

export const getCoursePhaseConfig = async (coursePhaseID: string): Promise<CoursePhaseConfig> => {
  const response = await assessmentAxiosInstance.get<CoursePhaseConfig>(
    `assessment/api/course_phase/${coursePhaseID}/config`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
