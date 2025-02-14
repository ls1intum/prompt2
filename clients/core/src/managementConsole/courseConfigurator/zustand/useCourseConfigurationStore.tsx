import { create } from 'zustand'
import { CoursePhaseType } from '../interfaces/coursePhaseType'
import { CoursePhaseGraphItem } from '../interfaces/coursePhaseGraphItem'
import { CoursePhaseWithPosition } from '../interfaces/coursePhaseWithPosition'
import { MetaDataGraphItem } from '../interfaces/courseMetaGraphItem'

interface CourseConfigurationState {
  coursePhaseTypes: CoursePhaseType[]
  coursePhaseGraph: CoursePhaseGraphItem[]
  coursePhases: CoursePhaseWithPosition[]
  metaDataGraph: MetaDataGraphItem[]
  setCoursePhaseTypes: (coursePhaseTypes: CoursePhaseType[]) => void
  removeUnsavedCoursePhases: () => void
  appendCoursePhaseType: (coursePhaseType: CoursePhaseType) => void
  setCoursePhaseGraph: (coursePhaseGraph: CoursePhaseGraphItem[]) => void
  setCoursePhases: (coursePhases: CoursePhaseWithPosition[]) => void
  appendCoursePhase: (coursePhase: CoursePhaseWithPosition) => void
  setMetaDataGraph: (metaDataGraph: MetaDataGraphItem[]) => void
}

export const useCourseConfigurationState = create<CourseConfigurationState>((set) => ({
  coursePhaseTypes: [],
  coursePhaseGraph: [],
  coursePhases: [],
  metaDataGraph: [],
  setCoursePhaseTypes: (coursePhaseTypes) => set({ coursePhaseTypes }),
  removeUnsavedCoursePhases: () =>
    set((state) => ({
      coursePhases: state.coursePhases.filter(
        (phase) => phase.id && !phase.id.startsWith('no-valid-id'),
      ),
    })),
  appendCoursePhaseType: (coursePhaseType: CoursePhaseType) =>
    set((state) => ({
      coursePhaseTypes: state.coursePhaseTypes.concat(coursePhaseType),
    })),
  setCoursePhaseGraph: (coursePhaseGraph) => set({ coursePhaseGraph }),
  setCoursePhases: (coursePhases) => set({ coursePhases }),
  appendCoursePhase: (coursePhase) =>
    set((state) => ({ coursePhases: state.coursePhases.concat(coursePhase) })),
  setMetaDataGraph: (metaDataGraph) => set({ metaDataGraph }),
}))
