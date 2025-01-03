import { ApplicationAssessment } from '@/interfaces/application_assessment'
import { axiosInstance } from '../configService'

export const postApplicationAssessment = async (
  phaseId: string,
  coursePhaseParticipationID: string,
  assessment: ApplicationAssessment,
): Promise<void> => {
  try {
    return await axiosInstance.post(
      `/api/applications/${phaseId}/${coursePhaseParticipationID}`,
      assessment,
      {
        headers: {
          'Content-Type': 'application/json-path+json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
