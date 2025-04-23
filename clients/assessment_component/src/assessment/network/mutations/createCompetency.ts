import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Competency, CreateCompetencyRequest } from '../../interfaces/competency'

export const createCompetency = async (
  coursePhaseID: string,
  competency: CreateCompetencyRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post<Competency>(
      `assessment/api/course_phase/${coursePhaseID}/competency`,
      competency,
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
