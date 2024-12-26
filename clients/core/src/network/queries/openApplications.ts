import { notAuthenticatedAxiosInstance } from '../configService'
import { OpenApplication } from '@/interfaces/open_application'

export const getAllOpenApplications = async (): Promise<OpenApplication[]> => {
  try {
    return (await notAuthenticatedAxiosInstance.get(`/api/apply`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
