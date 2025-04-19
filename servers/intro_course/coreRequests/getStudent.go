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

func SendGetStudent(authHeader string, coursePhaseID uuid.UUID) (*coreRequestDTOs.GetStudent, error) {
	path := "/api/course_phases/" + coursePhaseID.String() + "/participations/self"

	// Send the request with the payload attached
	resp, err := sendRequest("GET", path, authHeader, bytes.NewBuffer([]byte{}))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Error("Received non-OK response:", resp.Status)
		return nil, errors.New("non-OK response received")
	}

	// Decode the response body into a Student struct
	var student coreRequestDTOs.GetStudent
	if err := json.NewDecoder(resp.Body).Decode(&student); err != nil {
		log.Error("Failed to decode response body:", err)
		return nil, err
	}

	return &student, nil
}
