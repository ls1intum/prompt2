import { axiosInstance } from '@/network/configService'
import { GetApplication } from '../../interfaces/application/getApplication'

export const getApplication = async (coursePhaseId: string): Promise<GetApplication> => {
  try {
    return (await axiosInstance.get(`/api/apply/authenticated/${coursePhaseId}`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
