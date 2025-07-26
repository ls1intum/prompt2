import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button, ErrorPage } from '@tumaet/prompt-ui-components'

import { useStudentAssessmentStore } from '../../../zustand/useStudentAssessmentStore'
import { useParticipationStore } from '../../../zustand/useParticipationStore'
import { Person } from '../../../interfaces/team'

export const ParticipantNavigation = () => {
  const path = useLocation().pathname
  const navigate = useNavigate()

  const { team, assessmentParticipation } = useStudentAssessmentStore()
  const { participations } = useParticipationStore()

  const members = useMemo(() => {
    return (team?.members.filter((member) =>
      participations.some((p) => p.student.id === member.id),
    ) ||
      participations.map((p) => p.student) ||
      []) as Person[]
  }, [team?.members, participations])

  const currentIndex =
    members.findIndex((member) => member.id === assessmentParticipation?.courseParticipationID) ??
    -1

  const prevMember = members[(currentIndex - 1 + members.length) % members.length]
  const nextMember = members[(currentIndex + 1) % members.length]

  if (!assessmentParticipation) {
    return <ErrorPage message='No team or assessment participation found.' />
  }

  if (members.length <= 1) {
    return undefined
  }

  return (
    <div className='flex justify-between'>
      <Button
        variant='outline'
        onClick={() => navigate(path.replace(/\/[^/]*$/, `/${prevMember.id}`))}
      >
        <ChevronLeft className='h-4 w-4' />
        {prevMember.firstName} {prevMember.lastName}
      </Button>

      <Button
        variant='outline'
        onClick={() => navigate(path.replace(/\/[^/]*$/, `/${nextMember.id}`))}
      >
        {nextMember.firstName} {nextMember.lastName}
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
