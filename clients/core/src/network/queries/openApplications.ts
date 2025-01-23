import { notAuthenticatedAxiosInstance } from '@/network/configService'
import { OpenApplicationDetails } from '@/interfaces/open_application_details'

export const getAllOpenApplications = async (): Promise<OpenApplicationDetails[]> => {
  try {
    return (await notAuthenticatedAxiosInstance.get(`/api/apply`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
