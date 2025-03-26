import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'
import { SurveyTimeframe } from '../../interfaces/timeframe'

export const getSurveyTimeframe = async (coursePhaseID: string): Promise<SurveyTimeframe> => {
  try {
    return (
      await teamAllocationAxiosInstance.get(
        `/team-allocation/api/course_phase/${coursePhaseID}/survey/timeframe`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
