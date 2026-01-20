import { Student } from '@tumaet/prompt-shared-state'
import { create } from 'zustand'

interface studentById {
  [id: string]: Student
}

interface StudentStore {
  studentsById: studentById
  students: Student[]

  upsertStudent: (student: Student) => void
  upsertStudents: (students: Student[]) => void
}

export const useStudentStore = create<StudentStore>((set) => ({
  studentsById: {},
  students: [],
  upsertStudent: (student) =>
    set((state) => ({
      studentsById: {
        ...state.studentsById,
        [student.id!]: student,
      },
      students: [...state.students, student],
    })),
  upsertStudents: (students) =>
    set((state) => {
      const nextStudentsById = { ...state.studentsById }
      students.forEach((student) => {
        nextStudentsById[student.id!] = student
      })
      return { studentsById: nextStudentsById, students: state.students.concat(students) }
    }),
}))
