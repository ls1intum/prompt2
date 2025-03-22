import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DevProfileFilter } from '../interfaces/devProfileFilter'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

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
      const surveyFilterActive =
        filters.challengePassed.passed ||
        filters.challengePassed.notPassed ||
        filters.challengePassed.failed
      let passesChallenge = true
      if (surveyFilterActive) {
        // Assume false initially then try matching any active filter.
        passesChallenge = false
        if (filters.challengePassed.passed && profile) {
          passesChallenge = true
        }
        if (filters.challengePassed.notPassed && !profile) {
          passesChallenge = true
        }
        if (filters.challengePassed.failed && !profile) {
          passesChallenge = true
        }
      }

      return passesChallenge
    })
  }, [participants, filters])
}
