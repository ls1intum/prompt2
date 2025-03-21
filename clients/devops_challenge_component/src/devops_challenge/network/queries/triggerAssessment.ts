import { devOpsChallengeAxiosInstance } from '../devOpsChallengeServerConfig';
import { DeveloperProfile } from '../../interfaces/DeveloperProfile'

export const triggerAssessment = async (
    gitHubHandle: string,
    coursePhaseID: string,
    studentId: string
): Promise<string> => {
    try {
        const payload = {
            GithubUsername: gitHubHandle,
            StudentId: studentId,
        };

        const response = await devOpsChallengeAxiosInstance.post(
            `${coursePhaseID}/studentTest`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json-path+json',
                },
            }
        );

        return response.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
