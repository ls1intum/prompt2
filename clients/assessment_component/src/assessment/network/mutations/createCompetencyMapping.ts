import { assessmentAxiosInstance } from '../assessmentServerConfig'

export interface CompetencyMapping {
  fromCompetencyId: string
  toCompetencyId: string
}

export const createCompetencyMapping = async (
  coursePhaseID: string,
  mapping: CompetencyMapping,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/competency-mappings`,
      mapping,
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
