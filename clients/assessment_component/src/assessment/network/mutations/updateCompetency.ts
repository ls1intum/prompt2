import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Competency, UpdateCompetencyRequest } from '../../interfaces/competency'

export const updateCompetency = async (
  coursePhaseID: string,
  competency: UpdateCompetencyRequest,
): Promise<Competency> => {
  try {
    const response = await assessmentAxiosInstance.put<Competency>(
      `assessment/api/course_phase/${coursePhaseID}/competency/${competency.id}`,
      competency,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
