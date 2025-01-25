import { ApplicationFormWithDetails } from '../../interfaces/application/applicationFormWithDetails'
import { notAuthenticatedAxiosInstance } from '@/network/configService'

export const getApplicationFormWithDetails = async (
  coursePhaseId: string,
): Promise<ApplicationFormWithDetails> => {
  try {
    return (await notAuthenticatedAxiosInstance.get(`/api/apply/${coursePhaseId}`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
