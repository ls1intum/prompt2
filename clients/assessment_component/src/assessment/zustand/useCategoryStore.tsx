import { CategoryWithCompetencies } from '../interfaces/category'
import { create } from 'zustand'

export interface CategoryStore {
  categories: CategoryWithCompetencies[]
  setCategories: (categories: CategoryWithCompetencies[]) => void
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}))
