import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const getConfig = async (coursePhaseID: string): Promise<Record<string, boolean>> => {
  try {
    return (
      await selfTeamAllocationAxiosInstance.get(
        `/self-team-allocation/api/course_phase/${coursePhaseID}/config`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
