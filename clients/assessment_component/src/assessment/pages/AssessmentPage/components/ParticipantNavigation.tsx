import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@tumaet/prompt-ui-components'

import { useTeamStore } from '../../../zustand/useTeamStore'
import { useParticipationStore } from '../../../zustand/useParticipationStore'

export const ParticipantNavigation = () => {
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()
  const navigate = useNavigate()

  const { teams } = useTeamStore()
  const team = teams.find((t) => t.members.some((member) => member.id === courseParticipationID))
  const { participations } = useParticipationStore()

  const members = useMemo(() => {
    const validTeamMembers = team?.members.filter((member) =>
      participations.some((p) => p.courseParticipationID === member.id),
    )
    return (
      validTeamMembers ||
      participations.map((p) => ({
        id: p.courseParticipationID,
        firstName: p.student.firstName,
        lastName: p.student.lastName,
      }))
    )
  }, [team?.members, participations])

  const currentIndex = members.findIndex((member) => member.id === courseParticipationID) ?? -1

  const prevMember = members[(currentIndex - 1 + members.length) % members.length]
  const nextMember = members[(currentIndex + 1) % members.length]

  if (currentIndex === -1 || !prevMember || !nextMember || members.length <= 1) {
    return undefined
  }

  return (
    <div className='flex justify-between'>
      <Button
        variant='outline'
        onClick={() => navigate(`../${prevMember.id}`, { relative: 'path' })}
      >
        <ChevronLeft className='h-4 w-4' />
        {prevMember.firstName} {prevMember.lastName}
      </Button>

      <Button
        variant='outline'
        onClick={() => navigate(`../${nextMember.id}`, { relative: 'path' })}
      >
        {nextMember.firstName} {nextMember.lastName}
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
