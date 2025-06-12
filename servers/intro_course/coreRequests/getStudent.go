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
	resp, err := promptSDK.FetchAndMergeCourseParticipationWithResolution(coreURL, authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error fetching course participation with resolution: ", err)
		return nil, fmt.Errorf("failed to fetch course participation: %w", err)
	}

	if resp.Student.ID == uuid.Nil {
		log.Error("No student found for course participation: ", courseParticipationID)
		return nil, fmt.Errorf("no student found for course participation %s", courseParticipationID)
	}

	return &resp.Student, nil
}
