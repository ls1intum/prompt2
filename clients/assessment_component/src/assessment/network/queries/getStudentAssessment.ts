import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { StudentAssessment } from '../../interfaces/studentAssessment'

export const getStudentAssessment = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<StudentAssessment> => {
  const response = await assessmentAxiosInstance.get<StudentAssessment>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
