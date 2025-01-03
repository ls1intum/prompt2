import { axiosInstance } from '../configService'
import { ApplicationParticipation } from '@/interfaces/application_participations'

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
