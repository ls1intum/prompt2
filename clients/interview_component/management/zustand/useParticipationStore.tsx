import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'

export interface ParticipationStore {
  participations: CoursePhaseParticipationWithStudent[]
  setParticipations: (participations: CoursePhaseParticipationWithStudent[]) => void
}

export const useParticipationStore = create<ParticipationStore>((set) => ({
  participations: [],
  setParticipations: (participations) => set({ participations }),
}))
