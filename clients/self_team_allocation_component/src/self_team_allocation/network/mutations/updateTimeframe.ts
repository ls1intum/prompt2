import { selfTeamAllocationAxiosInstance } from '../selfTeamAllocationServerConfig'

export const updateTimeframe = async (
  coursePhaseID: string,
  startTime: Date,
  endTime: Date,
): Promise<void> => {
  try {
    const timeframeUpdate = {
      startTime: startTime,
      endTime: endTime,
    }
    await selfTeamAllocationAxiosInstance.put(
      `/self-team-allocation/api/course_phase/${coursePhaseID}/timeframe`,
      timeframeUpdate,
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
