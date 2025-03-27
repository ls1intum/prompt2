import { Skill } from '../../interfaces/skill'
import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const getAllTeams = async (coursePhaseID: string): Promise<Skill[]> => {
  try {
    return (
      await teamAllocationAxiosInstance.get(
        `/team-allocation/api/course_phase/${coursePhaseID}/team`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
