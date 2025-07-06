export interface CoursePhaseConfig {
  coursePhaseID: string // UUID as string
  assessmentTemplateID: string // UUID as string
  deadline: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate: string // UUID as string, optional
  selfEvaluationDeadline: Date // optional
  peerAssessmentEnabled: boolean
  peerAssessmentTemplate: string // UUID as string, optional
  peerAssessmentDeadline: Date // optional
}

export interface CreateOrUpdateCoursePhaseConfigRequest {
  assessmentTemplateId: string
  deadline?: Date
  selfEvaluationEnabled: boolean
  selfEvaluationTemplate?: string
  selfEvaluationDeadline?: Date
  peerAssessmentEnabled: boolean
  peerAssessmentTemplate?: string
  peerAssessmentDeadline?: Date
}
