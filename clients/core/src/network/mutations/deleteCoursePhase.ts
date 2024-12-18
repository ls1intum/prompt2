import { axiosInstance } from '../configService'

export const deleteCoursePhase = async (coursePhaseID: string): Promise<string | undefined> => {
  try {
    return await axiosInstance.delete(`/api/course_phases/${coursePhaseID}`, {
      headers: {
        'Content-Type': 'application/json-path+json',
      },
    })
  } catch (err) {
    console.error(err)
    throw err
  }
}
