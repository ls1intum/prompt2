export interface AssessmentTemplate {
  id: string
  name: string
  description: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAssessmentTemplateRequest {
  name: string
  description: string
}

export interface UpdateAssessmentTemplateRequest {
  name: string
  description: string
}

export interface CreateOrUpdateAssessmentTemplateCoursePhaseRequest {
  assessmentTemplateID: string
  coursePhaseID: string
}
