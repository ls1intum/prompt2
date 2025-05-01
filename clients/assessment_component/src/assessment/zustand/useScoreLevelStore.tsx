import { ScoreLevelWithParticipation } from '../interfaces/scoreLevelWithParticipation'
import { create } from 'zustand'

export interface ScoreLevelStore {
  scoreLevels: ScoreLevelWithParticipation[]
  setScoreLevels: (scoreLevels: ScoreLevelWithParticipation[]) => void
}

export const useScoreLevelStore = create<ScoreLevelStore>((set) => ({
  scoreLevels: [],
  setScoreLevels: (scoreLevels) => set({ scoreLevels }),
}))
