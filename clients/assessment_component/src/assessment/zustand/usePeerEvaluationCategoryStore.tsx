import { CategoryWithCompetencies } from '../interfaces/category'
import { Competency } from '../interfaces/competency'
import { create } from 'zustand'

export interface PeerEvaluationCategoryStore {
  peerEvaluationCategories: CategoryWithCompetencies[]
  allPeerEvaluationCompetencies: Competency[]
  setPeerEvaluationCategories: (categories: CategoryWithCompetencies[]) => void
}

export const usePeerEvaluationCategoryStore = create<PeerEvaluationCategoryStore>((set) => ({
  peerEvaluationCategories: [],
  allPeerEvaluationCompetencies: [],
  setPeerEvaluationCategories: (categories) =>
    set({
      peerEvaluationCategories: categories,
      allPeerEvaluationCompetencies: categories.flatMap((c) => c.competencies),
    }),
}))
