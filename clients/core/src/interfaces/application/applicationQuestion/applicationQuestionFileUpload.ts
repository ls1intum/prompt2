export interface ApplicationQuestionFileUpload {
  id: string
  coursePhaseID: string
  title: string
  description?: string
  isRequired: boolean
  allowedFileTypes?: string  // Comma-separated MIME types
  maxFileSizeMB?: number
  orderNum: number
  accessibleForOtherPhases?: boolean
  accessKey?: string
}
