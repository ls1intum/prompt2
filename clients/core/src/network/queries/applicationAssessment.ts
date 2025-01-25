import { axiosInstance } from '@/network/configService'
import { GetApplication } from '../../interfaces/application/getApplication'

export const getApplicationAssessment = async (
  coursePhaseId: string,
  coursePhaseParticipationID,
): Promise<GetApplication> => {
  try {
    return (
      await axiosInstance.get(`/api/applications/${coursePhaseId}/${coursePhaseParticipationID}`)
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
