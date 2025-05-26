import { Competency } from './competency'

export type Category = {
  id: string
  name: string
  shortName: string
  description?: string
  weight: number
}

export type CategoryWithCompetencies = {
  id: string
  name: string
  shortName: string
  description?: string
  weight: number
  competencies: Competency[]
}

export interface CreateCategoryRequest {
  name: string
  shortName: string
  description?: string
  weight: number
}

export interface UpdateCategoryRequest {
  id: string
  name?: string
  shortName?: string
  description?: string
  weight?: number
}
