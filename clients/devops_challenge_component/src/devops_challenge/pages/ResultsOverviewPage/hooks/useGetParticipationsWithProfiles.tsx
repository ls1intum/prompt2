import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export const useGetParticipationsWithProfiles = (
  participants: CoursePhaseParticipationWithStudent[],
  developerProfiles: DeveloperProfile[],
) => {
  return useMemo(() => {
    return (
      participants.map((participation) => {
        const profile =
          developerProfiles?.find(
            (devProfile) =>
              devProfile.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        return { participation, profile }
      }) || []
    )
  }, [participants, developerProfiles])
}
