import { axiosInstance } from '@/network/configService'
import { PostApplication } from '../../interfaces/application/postApplication'

export const postNewApplicationManual = async (
  phaseId: string,
  application: PostApplication,
): Promise<void> => {
  try {
    return await axiosInstance.post(`/api/applications/${phaseId}`, application, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
