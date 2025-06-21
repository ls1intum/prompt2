import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Assessment } from '../../interfaces/assessment'

export const getAllAssessmentsInPhase = async (coursePhaseID: string): Promise<Assessment[]> => {
  const response = await assessmentAxiosInstance.get<Assessment[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
