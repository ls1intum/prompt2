import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const deleteTutor = async (coursePhaseID: string, tutorID: string): Promise<void> => {
  try {
    await selfTeamAllocationAxiosInstance.delete(
      `self-team-allocation/api/course_phase/${coursePhaseID}/team/tutor/${tutorID}`,
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
