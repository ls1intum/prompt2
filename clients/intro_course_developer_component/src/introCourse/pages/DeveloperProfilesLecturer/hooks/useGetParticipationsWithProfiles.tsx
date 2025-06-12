import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'
import { GitlabStatus } from '../../../interfaces/GitlabStatus'
import { AppleStatus } from '../../../interfaces/AppleStatus'

export const useGetParticipationsWithProfiles = (
  participants: CoursePhaseParticipationWithStudent[],
  developerProfiles: DeveloperProfile[],
  gitlabStatuses: GitlabStatus[],
  appleStatuses: AppleStatus[],
) => {
  return useMemo(() => {
    return (
      participants.map((participation) => {
        const devProfile =
          developerProfiles?.find(
            (profile) => profile.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        const gitlabStatus =
          gitlabStatuses?.find(
            (status) => status.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        const appleStatus =
          appleStatuses?.find(
            (status) => status.courseParticipationID === participation.courseParticipationID,
          ) || undefined

        return { participation, devProfile, gitlabStatus, appleStatus }
      }) || []
    )
  }, [participants, developerProfiles, gitlabStatuses, appleStatuses])
}
