import { SurveyForm } from '../../interfaces/surveyForm'
import { teamAllocationAxiosInstance } from '../teamAllocationServerConfig'

export const getSurveyForm = async (coursePhaseID: string): Promise<SurveyForm | undefined> => {
  try {
    return (
      await teamAllocationAxiosInstance.get(
        `/team-allocation/api/course_phase/${coursePhaseID}/survey/form`,
      )
    ).data
  } catch (err: any) {
    console.error(err)
    if (err?.response?.status === 400) {
      // case that survey has not yet started
      return undefined
    } else {
      throw err
    }
  }
}
