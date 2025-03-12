import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export const useGetSortedParticipations = (
  sortConfig:
    | {
        key: string
        direction: 'ascending' | 'descending'
      }
    | undefined,
  participantsWithProfiles: {
    participation: CoursePhaseParticipationWithStudent
    profile: DeveloperProfile | undefined
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
      } else if (sortConfig.key === 'profileStatus') {
        aValue = a.profile ? 1 : 0
        bValue = b.profile ? 1 : 0
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
  }, [participantsWithProfiles, sortConfig])
}
