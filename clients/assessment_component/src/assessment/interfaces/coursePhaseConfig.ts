export interface CoursePhaseConfig {
  coursePhaseID: string // UUID as string
  assessmentTemplateID: string // UUID as string
  deadline: Date
  selfAssessmentEnabled: boolean
  selfAssessmentTemplate: string // UUID as string, optional
  selfAssessmentDeadline: Date // optional
  peerAssessmentEnabled: boolean
  peerAssessmentTemplate: string // UUID as string, optional
  peerAssessmentDeadline: Date // optional
}

export interface CreateOrUpdateCoursePhaseConfigRequest {
  assessmentTemplateId: string
  deadline?: Date
  selfAssessmentEnabled: boolean
  selfAssessmentTemplate?: string
  selfAssessmentDeadline?: Date
  peerAssessmentEnabled: boolean
  peerAssessmentTemplate?: string
  peerAssessmentDeadline?: Date
}
