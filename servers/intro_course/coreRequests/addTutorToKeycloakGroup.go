package coreRequests

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests/coreRequestDTOs"
	log "github.com/sirupsen/logrus"
)

func SendAddStudentsToKeycloakGroup(authHeader string, courseID uuid.UUID, studentIDs []uuid.UUID, groupName string) error {
	path := "/api/keycloak/" + courseID.String() + "/group/" + groupName + "/students"

	// Create the payload
	payload := coreRequestDTOs.AddStudentsToGroup{
		StudentsToAdd: studentIDs,
	}

	// Marshal payload to JSON
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Send the request with the payload attached
	resp, err := sendRequest("PUT", path, authHeader, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error("Received non-OK response:", resp.Status)
		return errors.New("non-OK response received")
	}

	return nil
}
