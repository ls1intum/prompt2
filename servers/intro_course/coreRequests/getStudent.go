package coreRequests

import (
	"fmt"

	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
	log "github.com/sirupsen/logrus"
)

func SendGetStudent(authHeader string, coursePhaseID uuid.UUID, courseParticipationID uuid.UUID) (*promptTypes.Student, error) {
	coreURL := utils.GetCoreUrl()
	resp, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		log.Error("Error fetching student data: ", err)
		return nil, err
	}

	for _, s := range resp {
		if s.CourseParticipationID == courseParticipationID {
			return &s.Student, nil
		}
	}
	return nil, fmt.Errorf("student with participation %s not found", courseParticipationID)
}
