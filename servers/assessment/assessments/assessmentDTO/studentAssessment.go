package assessmentDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/remainingAssessments/remainingAssessmentsDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

type StudentAssessment struct {
	CourseParticipationID uuid.UUID                                    `json:"courseParticipationID"`
	Assessments           []Assessment                                 `json:"assessments"`
	RemainingAssessments  remainingAssessmentsDTO.RemainingAssessments `json:"remainingAssessments"`
	AssessmentCompletion  assessmentCompletionDTO.AssessmentCompletion `json:"assessmentCompletion"`
	ScoreLevel            db.ScoreLevel                                `json:"scoreLevel"`
}
