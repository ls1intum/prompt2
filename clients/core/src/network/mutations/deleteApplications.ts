import { axiosInstance } from '../configService'

export const deleteApplications = async (
  coursePhaseID: string,
  coursePhaseParticipationIDs: string[],
): Promise<void> => {
  try {
    return await axiosInstance.delete(`/api/applications/${coursePhaseID}`, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
      data: coursePhaseParticipationIDs,
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
