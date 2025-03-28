import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const updateSurveyTimeframe = async (
  coursePhaseID: string,
  surveyStart: Date,
  surveyDeadline: Date,
): Promise<void> => {
  try {
    const timeframeUpdateRequest = {
      surveyStart: surveyStart,
      surveyDeadline: surveyDeadline,
    }
    await teamAllocationAxiosInstance.put(
      `/team-allocation/api/course_phase/${coursePhaseID}/survey/timeframe`,
      timeframeUpdateRequest,
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
