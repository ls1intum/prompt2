export interface AdditionalScoreUpload {
  name: string
  key: string
  threshold: number
  threshold_active: boolean
  scores: IndividualScore[]
}

export interface IndividualScore {
  course_phase_participation_id: string
  score: number
}

export interface AdditionalScore {
  key: string
  name: string
}
