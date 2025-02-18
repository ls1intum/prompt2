package keycloakTokenVerifier

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
)

type CoreAuthResponse struct {
	Roles                      []string  `json:"roles"`
	CoursePhaseParticipationID uuid.UUID `json:"id"`
	CourseParticipationID      uuid.UUID `json:"courseParticipationID"`
}

// SendStudentAuthRequest now accepts an authHeader parameter.
func SendAuthRequest(authHeader string, coursePhaseID uuid.UUID) (CoreAuthResponse, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	coreURL := utils.GetCoreUrl()
	requestURL := coreURL + "/api/auth/course_phase/" + coursePhaseID.String()
	// Pass nil as the body for a GET request.
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return CoreAuthResponse{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	// Set the provided authentication header.
	req.Header.Set("Authorization", authHeader)

	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return CoreAuthResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Println("Received non-OK response:", resp.Status)
		return CoreAuthResponse{}, nil
	}

	var authResponse CoreAuthResponse
	err = json.NewDecoder(resp.Body).Decode(&authResponse)
	if err != nil {
		log.Println("Error decoding response body:", err)
		return CoreAuthResponse{}, err
	}

	return authResponse, nil
}
