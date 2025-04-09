import { Competency } from './competency'

export type Category = {
  id: string
  name: string
  description?: string
  weight: number
}

export type CategoryWithCompetencies = {
  id: string
  name: string
  description?: string
  weight: number
  competencies: Competency[]
}

export type CategoryWithRemainingAssessments = {
  categoryID: string
  remainingAssessments: number
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  weight: number
}

export interface UpdateCategoryRequest {
  id: string
  name?: string
  description?: string
  weight?: number
}
