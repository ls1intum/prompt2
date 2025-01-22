import { axiosInstance } from '../configService'
import { UpdateCoursePhaseParticipation } from '@/interfaces/course_phase_participation'

export const updateCoursePhaseParticipation = async (
  participation: UpdateCoursePhaseParticipation,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.put(
        `/api/course_phases/${participation.course_phase_id}/participations/${participation.id}`,
        participation,
        {
          headers: {
            'Content-Type': 'application/json-path+json',
          },
        },
      )
    ).data.id // try to get the id of the updated participation
  } catch (err) {
    console.error(err)
    throw err
  }
}
