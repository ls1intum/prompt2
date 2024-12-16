import { create } from 'zustand'
import { CoursePhaseType } from '@/interfaces/course_phase_type'
import { CoursePhaseGraphItem } from '@/interfaces/course_phase_graph'
import { CoursePhasePosition } from '@/interfaces/course_phase_with_position'

interface CourseConfigurationState {
  coursePhaseTypes: CoursePhaseType[]
  coursePhaseGraph: CoursePhaseGraphItem[]
  coursePhases: CoursePhasePosition[]
  setCoursePhaseTypes: (coursePhaseTypes: CoursePhaseType[]) => void
  appendCoursePhaseType
  setCoursePhaseGraph: (coursePhaseGraph: CoursePhaseGraphItem[]) => void
  setCoursePhases: (coursePhases: CoursePhasePosition[]) => void
  appendCoursePhase: (coursePhase: CoursePhasePosition) => void
}

export const useCourseConfigurationState = create<CourseConfigurationState>((set) => ({
  coursePhaseTypes: [],
  coursePhaseGraph: [],
  coursePhases: [],
  setCoursePhaseTypes: (coursePhaseTypes) => set({ coursePhaseTypes }),
  appendCoursePhaseType: (coursePhaseType: CoursePhaseType) =>
    set((state) => ({
      coursePhaseTypes: state.coursePhaseTypes.concat(coursePhaseType),
    })),
  setCoursePhaseGraph: (coursePhaseGraph) => set({ coursePhaseGraph }),
  setCoursePhases: (coursePhases) => set({ coursePhases }),
  appendCoursePhase: (coursePhase) =>
    set((state) => ({ coursePhases: state.coursePhases.concat(coursePhase) })),
}))
