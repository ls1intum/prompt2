import { create } from 'zustand'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'

export interface CoursePhaseStore {
  coursePhase: CoursePhaseWithMetaData | undefined
  setCoursePhase: (coursePhase: CoursePhaseWithMetaData) => void
}

export const useCoursePhaseStore = create<CoursePhaseStore>((set) => ({
  coursePhase: undefined,
  setCoursePhase: (coursePhase) => set({ coursePhase }),
}))
