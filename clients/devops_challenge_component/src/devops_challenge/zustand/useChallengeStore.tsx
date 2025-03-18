import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface ChallengeStoreState {
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
  repoUrl?: string
  attempts?: number;
  maxAttempts?: number;
  feedback?: string
}

interface ChallengeStoreActions {
  setCoursePhaseParticipation: (coursePhaseParticipation: CoursePhaseParticipationWithStudent) => void
  setRepoUrl: (repoUrl?: string) => void
  setAttempts: (attempts?: number) => void
  setMaxAttempts: (maxAttempts?: number) => void
  setFeedback: (feedback?: string) => void
}

export const useChallengeStore = create<ChallengeStoreState & ChallengeStoreActions>((set) => ({
  repoUrl: '',
  attempts: 0,
  maxAttempts: 0,
  feedback: '',
  setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
  setRepoUrl: (repoUrl) => set({ repoUrl }),
  setAttempts: (attempts) => set({ attempts }),
  setMaxAttempts: (maxAttempts) => set({ maxAttempts }),
  setFeedback: (feedback) => set({ feedback }),
}))