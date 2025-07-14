import { StudentAssessment } from '../interfaces/studentAssessment'
import { create } from 'zustand'

export interface StudentAssessmentStore {
  studentAssessment: StudentAssessment | undefined
  setStudentAssessment: (assessment: StudentAssessment) => void
}

export const useStudentAssessmentStore = create<StudentAssessmentStore>((set) => ({
  studentAssessment: undefined,
  setStudentAssessment: (assessment) => set({ studentAssessment: assessment }),
}))
