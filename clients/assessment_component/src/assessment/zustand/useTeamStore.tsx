import { create } from 'zustand'

import { Team } from '../interfaces/team'

export interface TeamStore {
  teams: Team[]
  setTeams: (teams: Team[]) => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
}))
