import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const updateSkill = async (
  coursePhaseID: string,
  skillID: string,
  newSkillName: string,
): Promise<void> => {
  try {
    const skillRequest = {
      newSkillName: newSkillName,
    }
    await teamAllocationAxiosInstance.put(
      `/team-allocation/api/course_phase/${coursePhaseID}/skill/${skillID}`,
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
