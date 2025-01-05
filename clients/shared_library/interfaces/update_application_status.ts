import { PassStatus } from './course_phase_participation'

export interface UpdateApplicationStatus {
  pass_status: PassStatus
  course_phase_participation_ids: string[]
}
