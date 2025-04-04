import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const createSkills = async (coursePhaseID: string, skillNames: string[]): Promise<void> => {
  try {
    const skillRequest = {
      skillNames: skillNames,
    }
    await teamAllocationAxiosInstance.post(
      `/team-allocation/api/course_phase/${coursePhaseID}/skill`,
      skillRequest,
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
