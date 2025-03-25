import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const updateTeam = async (
  coursePhaseID: string,
  teamID: string,
  newTeamName: string,
): Promise<void> => {
  try {
    const teamRequest = {
      newTeamName: newTeamName,
    }
    await teamAllocationAxiosInstance.put(
      `/team-allocation/api/course_phase/${coursePhaseID}/team/${teamID}`,
      teamRequest,
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
