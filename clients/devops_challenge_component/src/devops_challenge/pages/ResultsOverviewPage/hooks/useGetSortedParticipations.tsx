import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import { DeveloperWithInfo } from '../../../interfaces/DeveloperWithInfo'

function sortPassStatus(filterItem) {
  return filterItem.participation.passStatus === PassStatus.PASSED
    ? 1
    : filterItem.participation.passStatus === PassStatus.NOT_ASSESSED
      ? 0
      : -1
}

function sortChallengeStatus(filterItem) {
  return filterItem.profile?.hasPassed ? 1 : !filterItem.profile?.hasPassed ? 0 : -1
}

export const useGetSortedParticipations = (
  sortConfig:
    | {
        key: string
        direction: 'ascending' | 'descending'
      }
    | undefined,
  participantsWithProfiles: {
    participation: CoursePhaseParticipationWithStudent
    profile: DeveloperWithInfo | undefined
  }[],
) => {
  return useMemo(() => {
    const sorted = [...participantsWithProfiles]
    if (!sortConfig) return sorted

    return sorted.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      if (sortConfig.key === 'name') {
        aValue =
          `${a.participation.student.firstName} ${a.participation.student.lastName}`.toLowerCase()
        bValue =
          `${b.participation.student.firstName} ${b.participation.student.lastName}`.toLowerCase()
      } else if (sortConfig.key === 'passStatus') {
        aValue = sortPassStatus(a)
        bValue = sortPassStatus(b)
      } else if (sortConfig.key === 'challengeStatus') {
        aValue = sortChallengeStatus(a)
        bValue = sortChallengeStatus(b)
      } else if (sortConfig.key === 'attempts') {
        aValue = a.profile?.attempts || 0
        bValue = b.profile?.attempts || 0
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
  }, [participantsWithProfiles, sortConfig])
}
