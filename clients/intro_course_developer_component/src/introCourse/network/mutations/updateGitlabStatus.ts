import { introCourseAxiosInstance } from '../introCourseServerConfig'

export const updateGitLabStatusCreated = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<void> => {
  try {
    return await introCourseAxiosInstance.put(
      `intro-course/api/course_phase/${coursePhaseID}/infrastructure/gitlab/student-setup/${courseParticipationID}/manual`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
