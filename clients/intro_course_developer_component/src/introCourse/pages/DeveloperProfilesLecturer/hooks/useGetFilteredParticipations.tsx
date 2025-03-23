import { DevProfileFilter } from '../interfaces/devProfileFilter'
import { useMemo } from 'react'
import { ParticipationWithDevProfiles } from '../interfaces/pariticipationWithDevProfiles'

export const useGetFilteredParticipations = (
  participants: ParticipationWithDevProfiles[],
  filters: DevProfileFilter,
) => {
  return useMemo(() => {
    return participants.filter(({ devProfile, gitlabStatus }) => {
      // Survey Status filter:
      // If at least one survey status filter is active, the participant must match at least one.
      const surveyFilterActive = filters.surveyStatus.completed || filters.surveyStatus.notCompleted
      let passesSurvey = true
      if (surveyFilterActive) {
        // Assume false initially then try matching any active filter.
        passesSurvey = false
        if (filters.surveyStatus.completed && devProfile) {
          passesSurvey = true
        }
        if (filters.surveyStatus.notCompleted && !devProfile) {
          passesSurvey = true
        }
      }

      // Devices filter:
      // For devices, if a filter is active, the entry must have that device.
      // (If no device filter is selected, passesDevices remains true.)
      let passesDevices = true
      if (filters.devices.macBook) {
        passesDevices = passesDevices && !!(devProfile && devProfile.hasMacBook)
      }
      if (filters.devices.iPhone) {
        passesDevices = passesDevices && !!(devProfile && devProfile.iPhoneUUID)
      }
      if (filters.devices.iPad) {
        passesDevices = passesDevices && !!(devProfile && devProfile.iPadUUID)
      }
      if (filters.devices.appleWatch) {
        passesDevices = passesDevices && !!(devProfile && devProfile.appleWatchUUID)
      }
      if (filters.devices.noDevices) {
        // "No Devices" means there is no profile or the profile has none of the devices.
        passesDevices =
          passesDevices &&
          (!devProfile ||
            (!devProfile.hasMacBook &&
              !devProfile.iPhoneUUID &&
              !devProfile.iPadUUID &&
              !devProfile.appleWatchUUID))
      }

      // Gitlab Status filter:
      let passesGitlab = true
      if (filters.gitlabNotCreated) {
        // If the filter is active, the entry must have no Gitlab status.
        passesGitlab = gitlabStatus === null || gitlabStatus?.gitlabSuccess === false
      }

      return passesSurvey && passesDevices && passesGitlab
    })
  }, [participants, filters])
}
