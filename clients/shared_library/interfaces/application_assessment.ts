import { PassStatus } from './course_phase_participation'

export interface ApplicationAssessment {
  Score?: number | null
  meta_data?: { [key: string]: any }
  pass_status?: PassStatus
}
