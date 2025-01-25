import { useMemo } from 'react'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { PassStatus } from '@tumaet/prompt-shared-state'

export const useSorting = (sortBy: string | undefined) => {
  const { participations, interviewSlots } = useParticipationStore()

  return useMemo(() => {
    if (!sortBy) return participations
    return participations.sort((a, b) => {
      switch (sortBy) {
        case 'Interview Date':
          const aSlot = interviewSlots.find(
            (slot) => slot.courseParticipationID === a.courseParticipationID,
          )
          const bSlot = interviewSlots.find(
            (slot) => slot.courseParticipationID === b.courseParticipationID,
          )
          return (
            (aSlot?.index || interviewSlots.length + 1) -
            (bSlot?.index || interviewSlots.length + 1)
          )
        case 'First Name':
          console.log('a:', a.student.firstName)
          console.log('b:', b.student.firstName)
          return a.student.firstName.localeCompare(b.student.firstName)
        case 'Last Name':
          return a.student.lastName.localeCompare(b.student.lastName)
        case 'Acceptance Status':
          const statusOrder = [PassStatus.PASSED, PassStatus.NOT_ASSESSED, PassStatus.FAILED]

          return (statusOrder.indexOf(a.passStatus) || 0) - (statusOrder.indexOf(b.passStatus) || 0)
        case 'Interview Score':
          return (
            (a.metaData.interviewScore || Number.MAX_VALUE) -
            (b.metaData.interviewScore || Number.MAX_VALUE)
          )
        default:
          return 0
      }
    })
  }, [participations, sortBy, interviewSlots])
}
