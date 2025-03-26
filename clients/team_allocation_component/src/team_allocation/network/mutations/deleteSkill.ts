import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const deleteSkill = async (coursePhaseID: string, skillID: string): Promise<void> => {
  try {
    await teamAllocationAxiosInstance.delete(
      `/team-allocation/api/course_phase/${coursePhaseID}/skill/${skillID}`,
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
