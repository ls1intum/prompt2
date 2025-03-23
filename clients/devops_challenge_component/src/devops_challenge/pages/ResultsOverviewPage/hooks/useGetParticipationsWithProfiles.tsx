import { useMemo } from 'react'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export const useGetParticipationsWithProfiles = (
  participants: CoursePhaseParticipationWithStudent[],
  developerProfiles: DeveloperProfile[],
) => {
  return useMemo(() => {
    return (
      console.log('participants', participants),
      participants.map((participation) => {
        if (!developerProfiles || developerProfiles.length === 0) {
          console.warn('No developer profiles found')
          return { participation, profile: undefined }
        }

        console.warn('developerProfiles', developerProfiles)

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
