import { UpdateApplicationForm } from '@/interfaces/application_form'
import { axiosInstance } from '../configService'

export const updateApplicationForm = async (
  coursePhaseID: string,
  applicationForm: UpdateApplicationForm,
): Promise<void> => {
  try {
    await axiosInstance.put(`/api/applications/${coursePhaseID}/form`, applicationForm, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
