import { axiosInstance } from '@/network/configService'
import { AdditionalScoreUpload } from '@/interfaces/additional_score'

export const postAdditionalScore = async (
  phaseId: string,
  additionalScore: AdditionalScoreUpload,
): Promise<void> => {
  try {
    return await axiosInstance.post(`/api/applications/${phaseId}/score`, additionalScore, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
