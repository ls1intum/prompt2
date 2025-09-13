export interface EvaluationOption {
  enabled: boolean
  template: string
  start?: Date
  deadline?: Date
}

export interface EvaluationOptions {
  self: EvaluationOption
  peer: EvaluationOption
  tutor: EvaluationOption
}
