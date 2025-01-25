import { AdditionalScore } from '../../ApplicationAdministration/interfaces/additionalScore/additionalScore'
import { axiosInstance } from '@/network/configService'

export const getAdditionalScoreNames = async (
  coursePhaseId: string,
): Promise<AdditionalScore[]> => {
  try {
    return (await axiosInstance.get(`/api/applications/${coursePhaseId}/score`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
