package keycloakCoreRequests

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier/keycloakTokenVerifierDTO"
	log "github.com/sirupsen/logrus"
)

func SendIsStudentRequest(authHeader string, coursePhaseID uuid.UUID) (keycloakTokenVerifierDTO.GetCoursePhaseParticipation, error) {
	path := "/api/auth/course_phase/" + coursePhaseID.String() + "/is_student"

	resp, err := sendRequest("GET", path, authHeader, nil)
	if err != nil {
		return keycloakTokenVerifierDTO.GetCoursePhaseParticipation{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		log.Info("Not student of course")
		return keycloakTokenVerifierDTO.GetCoursePhaseParticipation{IsStudentOfCoursePhase: false}, errors.New("not student of course")
	}

	if resp.StatusCode != http.StatusOK {
		log.Error("Received non-OK response:", resp.Status)
		return keycloakTokenVerifierDTO.GetCoursePhaseParticipation{}, nil
	}

	var isStudentResponse keycloakTokenVerifierDTO.GetCoursePhaseParticipation
	if err = json.NewDecoder(resp.Body).Decode(&isStudentResponse); err != nil {
		log.Error("Error decoding response body:", err)
		return keycloakTokenVerifierDTO.GetCoursePhaseParticipation{}, err
	}

	return isStudentResponse, nil
}
