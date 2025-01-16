import { useParams } from 'react-router-dom'
import { useParticipationStore } from './zustand/useParticipationStore'

export const ProfileDetailPage = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)

  return (
    <>
      <div>Hello World!</div>
      <p>{participation?.student.last_name}</p>
    </>
  )
}
