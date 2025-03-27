import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const getPassedStudentsCount = async (
  coursePhaseID: string,
): Promise<number> => {
  try {
    return (await devOpsChallengeAxiosInstance.get(`/${coursePhaseID}/passed`)).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
