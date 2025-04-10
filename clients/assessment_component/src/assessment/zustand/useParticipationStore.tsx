import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { create } from 'zustand'

export interface ParticipationStore {
  participations: CoursePhaseParticipationWithStudent[]
  setParticipations: (participations: CoursePhaseParticipationWithStudent[]) => void
}

export const useParticipationStore = create<ParticipationStore>((set) => ({
  participations: [],
  setParticipations: (participations) => set({ participations }),
}))
