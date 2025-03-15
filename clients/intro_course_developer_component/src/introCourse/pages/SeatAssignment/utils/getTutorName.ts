import { Tutor } from '../../../interfaces/Tutor'

export const getTutorName = (tutorId: string, tutors: Tutor[]): string => {
  const tutor = tutors.find((t) => t.id === tutorId)
  return tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Unknown Tutor'
}
