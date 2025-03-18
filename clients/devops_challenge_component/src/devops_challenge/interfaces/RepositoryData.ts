import { AssessmentResult } from './AssessmentResult'

export interface RepositoryData {
  repositoryUrl: string
  remainingAttempts: number
  lastAssessment: AssessmentResult | null
}