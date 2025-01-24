import { axiosInstance } from '@/network/configService'
import { ApplicationParticipation } from '../../ApplicationAdministration/interfaces/applicationParticipation'

export const getApplicationParticipations = async (
  coursePhaseID: string,
): Promise<ApplicationParticipation[]> => {
  try {
    return (await axiosInstance.get(`/api/applications/${coursePhaseID}/participations`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
