import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const deleteTeam = async (coursePhaseID: string, teamID: string): Promise<void> => {
  try {
    await selfTeamAllocationAxiosInstance.delete(
      `/self-team-allocation/api/course_phase/${coursePhaseID}/team/${teamID}`,
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
