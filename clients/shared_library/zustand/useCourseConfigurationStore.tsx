import { create } from 'zustand'
import { CoursePhaseType } from '@/interfaces/course_phase_type'
import { CoursePhaseGraphItem } from '@/interfaces/course_phase_graph'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'
import { MetaDataGraphItem } from '@/interfaces/course_meta_graph'

interface CourseConfigurationState {
  coursePhaseTypes: CoursePhaseType[]
  coursePhaseGraph: CoursePhaseGraphItem[]
  coursePhases: CoursePhasePosition[]
  metaDataGraph: MetaDataGraphItem[]
  setCoursePhaseTypes: (coursePhaseTypes: CoursePhaseType[]) => void
  removeUnsavedCoursePhases: () => void
  appendCoursePhaseType
  setCoursePhaseGraph: (coursePhaseGraph: CoursePhaseGraphItem[]) => void
  setCoursePhases: (coursePhases: CoursePhasePosition[]) => void
  appendCoursePhase: (coursePhase: CoursePhasePosition) => void
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
