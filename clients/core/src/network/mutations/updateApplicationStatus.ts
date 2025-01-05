import { axiosInstance } from '../configService'
import { UpdateApplicationStatus } from '@/interfaces/update_application_status'

export const updateApplicationStatus = async (
  coursePhaseID: string,
  updateApplications: UpdateApplicationStatus,
): Promise<void> => {
  try {
    await axiosInstance.put(`/api/applications/${coursePhaseID}/assessment`, updateApplications, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
