import { CoursePhaseParticipationWithStudent, PassStatus } from '@tumaet/prompt-shared-state'
import { DevProfileFilter } from '../interfaces/devProfileFilter'
import { useMemo } from 'react'
import { DeveloperProfile } from '../../../interfaces/DeveloperProfile'

export function passesChallengeFilter(
  profile: DeveloperProfile | undefined,
  filters: DevProfileFilter,
) {
  let passesChallenge = false
  if (filters.challengePassed.passed && profile?.hasPassed) {
    passesChallenge = true
  }
  let hasAttemptsLeft = (profile?.attempts || -1) < (profile?.maxAttempts || -1)
  if (filters.challengePassed.notPassed && profile?.hasPassed === false && hasAttemptsLeft) {
    passesChallenge = true
  }
  if (filters.challengePassed.failed && profile?.hasPassed === false && !hasAttemptsLeft) {
    passesChallenge = true
  }
  return passesChallenge
}

export function passesAssessmentFilter(
  student: CoursePhaseParticipationWithStudent,
  filters: DevProfileFilter,
) {
  let passesAssessment = false
  if (filters.passed.passed && student.passStatus === PassStatus.PASSED) {
    passesAssessment = true
  }
  if (filters.passed.notAssessed && student.passStatus === PassStatus.NOT_ASSESSED) {
    passesAssessment = true
  }
  if (filters.passed.failed && student.passStatus === PassStatus.FAILED) {
    passesAssessment = true
  }
  return passesAssessment
}

export const useGetFilteredParticipations = (
  participants: {
    participation: CoursePhaseParticipationWithStudent
    profile: DeveloperProfile | undefined
  }[],
  filters: DevProfileFilter,
) => {
  return useMemo(() => {
    return participants.filter(({ participation, profile }) => {
      const assessmentFilterActive =
        filters.passed.passed || filters.passed.notAssessed || filters.passed.failed

      let passesAssessment = true
      if (assessmentFilterActive) {
        passesAssessment = passesAssessmentFilter(participation, filters)
      }

      const challengeFilterActive =
        filters.challengePassed.passed ||
        filters.challengePassed.notPassed ||
        filters.challengePassed.failed
      let passesChallenge = true
      if (challengeFilterActive) {
        // Assume false initially then try matching any active filter.
        passesChallenge = passesChallengeFilter(profile, filters)
      }

      return passesChallenge && passesAssessment
    })
  }, [participants, filters])
}
