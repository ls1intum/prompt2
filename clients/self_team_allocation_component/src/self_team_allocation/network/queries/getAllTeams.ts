import { Team } from '../../interfaces/team'
import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const getAllTeams = async (coursePhaseID: string): Promise<Team[]> => {
  try {
    return (
      await selfTeamAllocationAxiosInstance.get(
        `/self-team-allocation/api/course_phase/${coursePhaseID}/team`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
