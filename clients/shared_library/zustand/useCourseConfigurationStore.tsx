import { create } from 'zustand'
import { CoursePhaseType } from '@/interfaces/course_phase_type'

interface CourseConfigurationState {
  coursePhaseTypes: CoursePhaseType[]
  setCoursePhaseTypes: (coursePhaseTypes: CoursePhaseType[]) => void
  appendCoursePhaseType
}

export const useCourseConfigurationState = create<CourseConfigurationState>((set) => ({
  coursePhaseTypes: [],
  setCoursePhaseTypes: (coursePhaseTypes) => set({ coursePhaseTypes }),
  appendCoursePhaseType: (coursePhaseType: CoursePhaseType) =>
    set((state) => ({
      coursePhaseTypes: state.coursePhaseTypes.concat(coursePhaseType),
    })),
}))
