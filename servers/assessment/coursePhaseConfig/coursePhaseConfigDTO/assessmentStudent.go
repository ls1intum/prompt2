package coursePhaseConfigDTO

import (
	"github.com/google/uuid"
	"github.com/ls1intum/prompt-sdk/promptTypes"
)

type AssessmentParticipationWithStudent struct {
	promptTypes.CoursePhaseParticipationWithStudent
	TeamID *uuid.UUID `json:"teamID,omitempty"`
}

func GetAssessmentStudentsFromParticipations(participations []promptTypes.CoursePhaseParticipationWithStudent) []AssessmentParticipationWithStudent {
	assessmentStudents := make([]AssessmentParticipationWithStudent, len(participations))

	for i, participation := range participations {
		teamIDStr, ok := participation.PrevData["teamAllocation"].(string)
		var teamID *uuid.UUID
		if ok {
			parsedTeamID, err := uuid.Parse(teamIDStr)
			if err == nil {
				teamID = &parsedTeamID
			}
		}

		assessmentStudents[i] = AssessmentParticipationWithStudent{
			CoursePhaseParticipationWithStudent: participation,
			TeamID:                              teamID,
		}
	}

	return assessmentStudents
}
