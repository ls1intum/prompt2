export interface CoursePhaseConfig {
  coursePhaseID: string // UUID as string
  assessmentTemplateID: string // UUID as string
  deadline: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate: string // UUID as string, optional
  selfEvaluationDeadline: Date // optional
  peerEvaluationEnabled: boolean
  peerEvaluationTemplate: string // UUID as string, optional
  peerEvaluationDeadline: Date // optional
}

export interface CreateOrUpdateCoursePhaseConfigRequest {
  assessmentTemplateId: string
  deadline?: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate?: string
  selfEvaluationDeadline?: Date
  peerEvaluationEnabled: boolean
  peerEvaluationTemplate?: string
  peerEvaluationDeadline?: Date
}
