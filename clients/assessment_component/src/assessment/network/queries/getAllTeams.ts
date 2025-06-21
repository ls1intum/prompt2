import { assessmentAxiosInstance } from '../assessmentServerConfig'

import { Team } from '../../interfaces/team'

export const getAllTeams = async (coursePhaseID: string): Promise<Team[]> => {
  const response = await assessmentAxiosInstance.get<Team[]>(
    `assessment/api/course_phase/${coursePhaseID}/config/teams`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
