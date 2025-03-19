import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface ChallengeStoreState {
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
  repoUrl?: string
  attempts?: number;
  maxAttempts?: number;
  feedback?: string
  hasPassed?: boolean;
}

interface ChallengeStoreActions {
  setCoursePhaseParticipation: (coursePhaseParticipation: CoursePhaseParticipationWithStudent) => void
  setRepoUrl: (repoUrl?: string) => void
  setAttempts: (attempts?: number) => void
  setMaxAttempts: (maxAttempts?: number) => void
  setFeedback: (feedback?: string) => void
  setHasPassed: (status: boolean) => void;
}

export const useChallengeStore = create<ChallengeStoreState & ChallengeStoreActions>((set) => ({
  repoUrl: undefined,
  attempts: undefined,
  maxAttempts: undefined,
  feedback: undefined,
  hasPassed: undefined,

  setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
  setRepoUrl: (repoUrl) => set({ repoUrl }),
  setAttempts: (attempts) => set({ attempts }),
  setMaxAttempts: (maxAttempts) => set({ maxAttempts }),
  setFeedback: (feedback) => set({ feedback }),
  setHasPassed: (status) => set({ hasPassed: status }), 
}))