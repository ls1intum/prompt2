export type Competency = {
  id: string
  categoryID: string
  name: string
  shortName: string
  description: string
  novice: string
  intermediate: string
  advanced: string
  expert: string
  weight: number
}

export type CreateCompetencyRequest = {
  categoryID: string
  name: string
  shortName: string
  description: string
  novice: string
  intermediate: string
  advanced: string
  expert: string
  weight: number
}

export type UpdateCompetencyRequest = {
  id: string
  categoryID?: string
  name?: string
  shortName?: string
  description?: string
  novice?: string
  intermediate?: string
  advanced?: string
  expert?: string
  weight?: number
}
