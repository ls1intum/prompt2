import { ApplicationForm } from '../../ApplicationAdministration/interfaces/form/applicationForm'
import { axiosInstance } from '@/network/configService'

export const getApplicationForm = async (coursePhaseId: string): Promise<ApplicationForm> => {
  try {
    return (await axiosInstance.get(`/api/applications/${coursePhaseId}/form`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
