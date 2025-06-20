import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getDeadline = async (coursePhaseID: string): Promise<Date> => {
  const response = await assessmentAxiosInstance.get<Date>(
    `assessment/api/course_phase/${coursePhaseID}/deadline`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
