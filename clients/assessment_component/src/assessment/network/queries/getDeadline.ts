import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const getDeadline = async (coursePhaseID: string): Promise<Date> => {
  const response = await assessmentAxiosInstance.get<string>(
    `assessment/api/course_phase/${coursePhaseID}/config/deadline`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return new Date(response.data)
}
