import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../interfaces/DeveloperProfile'

interface DevOpsChallengeStoreState {
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
  githubHandle?: string
  developerProfile?: DeveloperProfile
}

interface DevOpsChallengeStoreActions {
  setDeveloperProfile: (developerProfile: DeveloperProfile) => void
  setGithubHandle: (githubHandle: string) => void
  setCoursePhaseParticipation: (
    coursePhaseParticipation: CoursePhaseParticipationWithStudent,
  ) => void
}

export const useDevOpsChallengeStore = create<DevOpsChallengeStoreState & DevOpsChallengeStoreActions>(
  (set) => ({
    developerProfile: undefined,
    githubHandle: undefined,
    setDeveloperProfile: (developerProfile) => set({ developerProfile }),
    setGithubHandle: (githubHandle) => set({ githubHandle }),
    setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
  })
)