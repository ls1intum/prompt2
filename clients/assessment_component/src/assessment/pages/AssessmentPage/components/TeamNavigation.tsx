import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button, ErrorPage } from '@tumaet/prompt-ui-components'

import { useStudentAssessmentStore } from '../../../zustand/useStudentAssessmentStore'

export const TeamNavigation = () => {
  const path = useLocation().pathname
  const navigate = useNavigate()

  const { team, assessmentParticipation } = useStudentAssessmentStore()

  const currentIndex =
    team?.members.findIndex(
      (member) => member.id === assessmentParticipation?.courseParticipationID,
    ) ?? -1

  const prevMember = team?.members[(currentIndex - 1 + team.members.length) % team.members.length]
  const nextMember = team?.members[(currentIndex + 1) % team.members.length]

  if (!team || !assessmentParticipation || !prevMember || !nextMember) {
    return <ErrorPage message='No team or assessment participation found.' />
  }

  return (
    <div className='flex justify-between'>
      <Button
        variant='outline'
        onClick={() =>
          navigate(
            path.replace(
              /\/[^/]*$/,
              `/${team?.members[(currentIndex - 1 + team.members.length) % team.members.length]?.id}`,
            ),
          )
        }
      >
        <ChevronLeft className='h-4 w-4' />
        {prevMember.firstName} {prevMember.lastName}
      </Button>

      <Button
        variant='outline'
        onClick={() =>
          navigate(
            path.replace(
              /\/[^/]*$/,
              `/${team?.members[(currentIndex + 1) % team.members.length]?.id}`,
            ),
          )
        }
      >
        {nextMember.firstName} {nextMember.lastName}
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
