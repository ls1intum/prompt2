import { axiosInstance } from '@/network/configService'
import { UpdateCoursePhaseParticipation } from '@tumaet/prompt-shared-state'

export const updateCoursePhaseParticipation = async (
  participation: UpdateCoursePhaseParticipation,
): Promise<string | undefined> => {
  try {
    return (
      await axiosInstance.put(
        `/api/course_phases/${participation.coursePhaseID}/participations/${participation.id}`,
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
