import { create } from 'zustand'
import { Course } from '@/interfaces/course'

interface CourseStoreState {
  selectedCourse?: Course
  courses: Course[]
}

interface CourseStoreAction {
  setSelectedCourse: (selectedCourse?: Course) => void
  setCourses: (courses: Course[]) => void
}

export const useCourseStore = create<CourseStoreState & CourseStoreAction>((set) => ({
  courses: [],
  setSelectedCourse: (selectedCourse?: Course) => {
    if (selectedCourse) {
      localStorage.setItem('selected-course', selectedCourse.id)
    } else {
      localStorage.removeItem('selected-course')
    }

    set({ selectedCourse })
  },
  setCourses: (courses: Course[]) => set({ courses }),
}))
