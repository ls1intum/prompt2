import { axiosInstance } from '../configService'
import { UpdateCoursePhaseParticipationStatus } from '@/interfaces/update_course_phase_participation_status'

export const updateApplicationStatus = async (
  coursePhaseID: string,
  updateApplications: UpdateCoursePhaseParticipationStatus,
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
