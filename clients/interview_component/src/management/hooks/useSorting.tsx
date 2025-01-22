import { useMemo } from 'react'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { PassStatus } from '@/interfaces/course_phase_participation'

export const useSorting = (sortBy: string | undefined) => {
  const { participations, interviewSlots } = useParticipationStore()

  return useMemo(() => {
    if (!sortBy) return participations
    return participations.sort((a, b) => {
      switch (sortBy) {
        case 'Interview Date':
          const aSlot = interviewSlots.find(
            (slot) => slot.courseParticipationId === a.course_participation_id,
          )
          const bSlot = interviewSlots.find(
            (slot) => slot.courseParticipationId === b.course_participation_id,
          )
          return (
            (aSlot?.index || interviewSlots.length + 1) -
            (bSlot?.index || interviewSlots.length + 1)
          )
        case 'First Name':
          console.log('a:', a.student.first_name)
          console.log('b:', b.student.first_name)
          return a.student.first_name.localeCompare(b.student.first_name)
        case 'Last Name':
          return a.student.last_name.localeCompare(b.student.last_name)
        case 'Acceptance Status':
          const statusOrder = [PassStatus.PASSED, PassStatus.NOT_ASSESSED, PassStatus.FAILED]

          return (
            (statusOrder.indexOf(a.pass_status) || 0) - (statusOrder.indexOf(b.pass_status) || 0)
          )
        case 'Interview Score':
          return (
            (a.meta_data.interviewScore || Number.MAX_VALUE) -
            (b.meta_data.interviewScore || Number.MAX_VALUE)
          )
        default:
          return 0
      }
    })
  }, [participations, sortBy, interviewSlots])
}
