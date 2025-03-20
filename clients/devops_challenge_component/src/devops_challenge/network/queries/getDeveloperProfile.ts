import { DeveloperProfile } from '../../interfaces/DeveloperProfile'
import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig'

export const getDeveloperProfile = async (
    coursePhaseID: string
): Promise<DeveloperProfile> => {
    try {
        return (
            await devOpsChallengeAxiosInstance.get(
                `/${coursePhaseID}/info`,
            )
        ).data
    } catch (err) {
        console.error(err)
        throw err
    }
}
