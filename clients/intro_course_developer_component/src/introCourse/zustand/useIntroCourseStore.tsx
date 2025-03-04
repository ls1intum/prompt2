import { create } from 'zustand'
import { DeveloperProfile } from '../interfaces/DeveloperProfile'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

interface IntroCourseStoreState {
  developerProfile?: DeveloperProfile
  coursePhaseParticipation?: CoursePhaseParticipationWithStudent
}

interface IntroCourseStoreAction {
  setDeveloperProfile: (developerProfile: DeveloperProfile) => void
  setCoursePhaseParticipation: (
    coursePhaseParticipation: CoursePhaseParticipationWithStudent,
  ) => void
}

export const useIntroCourseStore = create<IntroCourseStoreState & IntroCourseStoreAction>(
  (set) => ({
    developerProfile: undefined,
    setDeveloperProfile: (developerProfile) => set({ developerProfile }),
    setCoursePhaseParticipation: (coursePhaseParticipation) => set({ coursePhaseParticipation }),
  }),
)
