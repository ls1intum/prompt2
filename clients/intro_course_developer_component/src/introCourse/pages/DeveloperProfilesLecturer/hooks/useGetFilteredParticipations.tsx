import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DevProfileFilter } from '../interfaces/devProfileFilter'
import { useMemo } from 'react'
import { DeveloperProfile } from 'src/introCourse/interfaces/DeveloperProfile'

export const useGetFilteredParticipations = (
  participants: {
    participation: CoursePhaseParticipationWithStudent
    profile: DeveloperProfile | undefined
  }[],
  filters: DevProfileFilter,
) => {
  return useMemo(() => {
    return participants.filter(({ profile }) => {
      // Survey Status filter:
      // If at least one survey status filter is active, the participant must match at least one.
      const surveyFilterActive = filters.surveyStatus.completed || filters.surveyStatus.notCompleted
      let passesSurvey = true
      if (surveyFilterActive) {
        // Assume false initially then try matching any active filter.
        passesSurvey = false
        if (filters.surveyStatus.completed && profile) {
          passesSurvey = true
        }
        if (filters.surveyStatus.notCompleted && !profile) {
          passesSurvey = true
        }
      }

      // Devices filter:
      // For devices, if a filter is active, the entry must have that device.
      // (If no device filter is selected, passesDevices remains true.)
      let passesDevices = true
      if (filters.devices.macBook) {
        passesDevices = passesDevices && !!(profile && profile.hasMacBook)
      }
      if (filters.devices.iPhone) {
        passesDevices = passesDevices && !!(profile && profile.iPhoneUUID)
      }
      if (filters.devices.iPad) {
        passesDevices = passesDevices && !!(profile && profile.iPadUUID)
      }
      if (filters.devices.appleWatch) {
        passesDevices = passesDevices && !!(profile && profile.appleWatchUUID)
      }
      if (filters.devices.noDevices) {
        // "No Devices" means there is no profile or the profile has none of the devices.
        passesDevices =
          passesDevices &&
          (!profile ||
            (!profile.hasMacBook &&
              !profile.iPhoneUUID &&
              !profile.iPadUUID &&
              !profile.appleWatchUUID))
      }

      return passesSurvey && passesDevices
    })
  }, [participants, filters])
}
