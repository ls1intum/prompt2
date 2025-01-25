import { ApplicationAssessment } from '../../ApplicationAdministration/interfaces/applicationAssessment'
import { axiosInstance } from '@/network/configService'

export const postApplicationAssessment = async (
  phaseId: string,
  coursePhaseParticipationID: string,
  assessment: ApplicationAssessment,
): Promise<void> => {
  try {
    return await axiosInstance.put(
      `/api/applications/${phaseId}/${coursePhaseParticipationID}/assessment`,
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
