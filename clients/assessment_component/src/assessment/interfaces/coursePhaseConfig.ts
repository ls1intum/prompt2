export interface CoursePhaseConfig {
  coursePhaseID: string // UUID as string
  assessmentTemplateID: string // UUID as string
  start: Date
  deadline: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate: string // UUID as string
  selfEvaluationStart: Date
  selfEvaluationDeadline: Date
  peerEvaluationEnabled: boolean
  peerEvaluationTemplate: string // UUID as string
  peerEvaluationStart: Date
  peerEvaluationDeadline: Date
}

export interface CreateOrUpdateCoursePhaseConfigRequest {
  assessmentTemplateId: string
  start?: Date
  deadline?: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate?: string
  selfEvaluationStart?: Date
  selfEvaluationDeadline?: Date
  peerEvaluationEnabled: boolean
  peerEvaluationTemplate?: string
  peerEvaluationStart?: Date
  peerEvaluationDeadline?: Date
}
