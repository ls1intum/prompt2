import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'
import { GitlabStatus } from '../../../interfaces/GitlabStatus'

export const useGetParticipationsWithProfiles = (
  participants: CoursePhaseParticipationWithStudent[],
  developerProfiles: DeveloperProfile[],
  gitlabStatuses: GitlabStatus[],
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

        return { participation, devProfile, gitlabStatus }
      }) || []
    )
  }, [participants, developerProfiles, gitlabStatuses])
}
