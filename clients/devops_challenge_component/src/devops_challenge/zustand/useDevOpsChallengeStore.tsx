import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { DeveloperProfile } from '../interfaces/DeveloperProfile'

interface DevOpsChallengeStoreState {
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
  githubHandle?: string
  feedback?: string
  developerProfile?: DeveloperProfile
}

interface DevOpsChallengeStoreActions {
  setDeveloperProfile: (developerProfile: DeveloperProfile) => void
  setGithubHandle: (githubHandle: string) => void
  setFeedback: (feedback: string) => void
  setCoursePhaseParticipation: (
    coursePhaseParticipation: CoursePhaseParticipationWithStudent,
  ) => void
}

export const useDevOpsChallengeStore = create<
  DevOpsChallengeStoreState & DevOpsChallengeStoreActions
>((set) => ({
  developerProfile: undefined,
  githubHandle: undefined,
  feedback: undefined,
  setDeveloperProfile: (developerProfile) => set({ developerProfile }),
  setGithubHandle: (githubHandle) => set({ githubHandle }),
  setFeedback: (feedback) => set({ feedback }),
  setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
}))