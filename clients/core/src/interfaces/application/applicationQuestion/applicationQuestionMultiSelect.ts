export interface ApplicationQuestionMultiSelect {
  id: string
  coursePhaseID: string
  title: string
  description?: string
  placeholder?: string
  errorMessage?: string
  isRequired: boolean
  minSelect: number
  maxSelect: number
  options: string[]
  orderNum: number
  accessibleForOtherPhases?: boolean
  accessKey?: string
}
