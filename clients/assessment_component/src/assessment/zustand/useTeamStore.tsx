import { create } from 'zustand'

import { Team } from '@tumaet/prompt-shared-state'

export interface TeamStore {
  teams: Team[]
  setTeams: (teams: Team[]) => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
}))
