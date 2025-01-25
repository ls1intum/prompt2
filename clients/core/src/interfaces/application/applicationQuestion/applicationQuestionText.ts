export interface ApplicationQuestionText {
  id: string
  coursePhaseID: string
  title: string
  description?: string
  placeholder?: string
  validationRegex?: string
  errorMessage?: string
  isRequired: boolean
  allowedLength?: number
  orderNum: number
  accessibleForOtherPhases?: boolean
  accessKey?: string
}
