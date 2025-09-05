import { CategoryWithCompetencies } from '../interfaces/category'
import { Competency } from '../interfaces/competency'
import { create } from 'zustand'

export interface TutorEvaluationCategoryStore {
  tutorEvaluationCategories: CategoryWithCompetencies[]
  allTutorEvaluationCompetencies: Competency[]
  setTutorEvaluationCategories: (categories: CategoryWithCompetencies[]) => void
}

export const useTutorEvaluationCategoryStore = create<TutorEvaluationCategoryStore>((set) => ({
  tutorEvaluationCategories: [],
  allTutorEvaluationCompetencies: [],
  setTutorEvaluationCategories: (categories) =>
    set({
      tutorEvaluationCategories: categories,
      allTutorEvaluationCompetencies: categories.flatMap((c) => c.competencies),
    }),
}))
