import { Student } from '@/interfaces/student'

export interface StudentComponentRef {
  validate: () => Promise<boolean>
  rerender: (updatedStudent: Student) => void
}
