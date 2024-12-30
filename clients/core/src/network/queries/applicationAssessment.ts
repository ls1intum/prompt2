import { axiosInstance } from '../configService'
import { GetApplication } from '@/interfaces/get_application'

export const getApplicationAssessment = async (
  coursePhaseId: string,
  coursePhaseParticipationID,
): Promise<GetApplication> => {
  try {
    return (
      await axiosInstance.get(
        `/api/apply/authenticated/${coursePhaseId}/${coursePhaseParticipationID}`,
      )
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
