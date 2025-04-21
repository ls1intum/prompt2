export type ValidationResult = {
  label: string
  isValid: boolean
  details?: string
  category: 'previous' | 'devices' | 'comments' | 'score' | 'language' | 'survey'
  highLevelCategory: 'previous' | 'survey'
  completionRate: number
  icon: React.ReactNode
}
