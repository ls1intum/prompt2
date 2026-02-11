import { templateAxiosInstance } from '../templateServerConfig'

export const getTemplateInfo = async (coursePhaseID: string): Promise<string> => {
  try {
    return (
      await templateAxiosInstance.get(`/template-service/api/course_phase/${coursePhaseID}/info`)
    ).data
  } catch (err) {
    console.error(err)
    throw err
  }
}
