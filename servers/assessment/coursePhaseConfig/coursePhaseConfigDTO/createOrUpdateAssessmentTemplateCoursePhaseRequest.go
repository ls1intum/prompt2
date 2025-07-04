package coursePhaseConfigDTO

import "github.com/google/uuid"

type CreateOrUpdateAssessmentTemplateCoursePhaseRequest struct {
	AssessmentTemplateID uuid.UUID `json:"assessmentTemplateId"`
	CoursePhaseID        uuid.UUID `json:"coursePhaseId"`
}
