import { axiosInstance } from '../configService'

export const getAdditionalScoreNames = async (coursePhaseId: string): Promise<string[]> => {
  try {
    return (await axiosInstance.get(`/api/applications/${coursePhaseId}/score`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
