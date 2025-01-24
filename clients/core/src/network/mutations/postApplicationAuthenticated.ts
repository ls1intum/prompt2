import { axiosInstance } from '@/network/configService'
import { PostApplication } from '../../interfaces/application/postApplication'

export const postNewApplicationAuthenticated = async (
  phaseId: string,
  application: PostApplication,
): Promise<void> => {
  try {
    return await axiosInstance.post(`/api/apply/authenticated/${phaseId}`, application, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
