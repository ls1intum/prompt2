import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const getAllDeveloperProfiles = async (
  coursePhaseID: string,
): Promise<DeveloperProfile[]> => {
  try {
    return (await devOpsChallengeAxiosInstance.get(`/${coursePhaseID}/students`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
