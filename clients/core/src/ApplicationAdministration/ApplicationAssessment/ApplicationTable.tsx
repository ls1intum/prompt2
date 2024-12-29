import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseParticipations } from '../../network/queries/getCoursePhaseParticipations'

export const ApplicationTable = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const {
    data: fetchedParticipations,
    isPending: isParticipationsPending,
    error: participantsError,
    isError: isParticipantsError,
  } = useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['course_phase_participations', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  return (
    <div>
      <h1>Application Table</h1>
      {isParticipationsPending && <p>Loading...</p>}
      {fetchedParticipations?.map((participation) => (
        <div key={participation.id}>
          <p>{participation.student.first_name}</p>
          <p>{participation.passed ? 'Passed' : 'Failed'}</p>
        </div>
      ))}
    </div>
  )
}
