import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const createTeamAssignment = async (
  coursePhaseID: string,
  teamID: string,
): Promise<void> => {
  try {
    await selfTeamAllocationAxiosInstance.put(
      `/self-team-allocation/api/course_phase/${coursePhaseID}/team/${teamID}/assignment`,
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
