import { PassStatus } from '@tumaet/prompt-shared-state'

export interface ApplicationAssessment {
  Score?: number | null
  metaData?: { [key: string]: any }
  passStatus?: PassStatus
}
