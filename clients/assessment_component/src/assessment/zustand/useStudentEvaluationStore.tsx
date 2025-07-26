import { create } from 'zustand'

export interface StudentEvaluationStore {
  studentName: string | undefined
  courseParticipationID: string | undefined
  authorCourseParticipationID: string | undefined
  setStudentName: (name: string) => void
  setCourseParticipationID: (id: string) => void
  setAuthorCourseParticipationID: (id: string) => void
}

export const useStudentEvaluationStore = create<StudentEvaluationStore>((set) => ({
  studentName: undefined,
  courseParticipationID: undefined,
  authorCourseParticipationID: undefined,
  setStudentName: (name) => set({ studentName: name }),
  setCourseParticipationID: (id) => set({ courseParticipationID: id }),
  setAuthorCourseParticipationID: (id) => set({ authorCourseParticipationID: id }),
}))
