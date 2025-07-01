import { Team } from '../../interfaces/team'
import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const getAllTeams = async (coursePhaseID: string): Promise<Team[]> => {
  try {
    return (
      await teamAllocationAxiosInstance.get(
        `/team-allocation/api/course_phase/${coursePhaseID}/team`,
      )
    ).data.teams
  } catch (err) {
    console.error(err)
    throw err
  }
}
