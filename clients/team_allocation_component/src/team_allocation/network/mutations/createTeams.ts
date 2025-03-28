import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const createTeams = async (coursePhaseID: string, teamNames: string[]): Promise<void> => {
  try {
    const teamsRequest = {
      teamNames: teamNames,
    }
    await teamAllocationAxiosInstance.post(
      `/team-allocation/api/course_phase/${coursePhaseID}/team`,
      teamsRequest,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
