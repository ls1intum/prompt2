import { TeamAllocationConfig } from '../../interfaces/config'
import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const getConfig = async (coursePhaseID: string): Promise<TeamAllocationConfig> => {
  try {
    return (
      await teamAllocationAxiosInstance.get(
        `/team-allocation/api/course_phase/${coursePhaseID}/config`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
