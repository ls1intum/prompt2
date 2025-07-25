package assessmentDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationDTO"
)

type StudentAssessment struct {
	CourseParticipationID uuid.UUID                                    `json:"courseParticipationID"`
	Assessments           []Assessment                                 `json:"assessments"`
	AssessmentCompletion  assessmentCompletionDTO.AssessmentCompletion `json:"assessmentCompletion"`
	StudentScore          scoreLevelDTO.StudentScore                   `json:"studentScore"`
	SelfEvaluations       []evaluationDTO.Evaluation                   `json:"selfEvaluations"`
	PeerEvaluations       []evaluationDTO.Evaluation                   `json:"peerEvaluations"`
}
