import { create } from 'zustand'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { UploadedStudent } from '../interfaces/UploadedStudent'

export interface MatchingStore {
  participations: CoursePhaseParticipationWithStudent[]
  uploadedData: UploadedStudent[]
  setParticipations: (participations: CoursePhaseParticipationWithStudent[]) => void
  setUploadedData: (uploadedData: UploadedStudent[]) => void
}

export const useMatchingStore = create<MatchingStore>((set) => ({
  participations: [],
  uploadedData: [],
  setParticipations: (participations) => set({ participations }),
  setUploadedData: (uploadedData: UploadedStudent[]) => set({ uploadedData }),
}))
