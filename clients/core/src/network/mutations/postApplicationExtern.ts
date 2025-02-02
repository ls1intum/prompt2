import { notAuthenticatedAxiosInstance } from '@/network/configService'
import { PostApplication } from '../../interfaces/application/postApplication'

export const postNewApplicationExtern = async (
  phaseId: string,
  application: PostApplication,
): Promise<void> => {
  try {
    return await notAuthenticatedAxiosInstance.post(`/api/apply/${phaseId}`, application, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
