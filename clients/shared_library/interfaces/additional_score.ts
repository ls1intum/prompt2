export interface AdditionalScore {
  name: string
  threshold: number
  threshold_active: boolean
  scores: IndividualScore[]
}

export interface IndividualScore {
  course_phase_participation_id: string
  score: number
}
