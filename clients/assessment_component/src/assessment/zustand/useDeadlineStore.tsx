import { create } from 'zustand'

export interface DeadlineStore {
  deadline: Date | undefined
  setDeadline: (deadline: Date) => void
}

export const useDeadlineStore = create<DeadlineStore>((set) => ({
  deadline: undefined,
  setDeadline: (deadline) => set({ deadline }),
}))
