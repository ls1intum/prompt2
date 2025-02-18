package keycloakTokenVerifier

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
)

type StudentAuthResponse struct {
	ID                    uuid.UUID `json:"id"`
	CourseParticipationID uuid.UUID `json:"courseParticipationID"`
}

// SendStudentAuthRequest now accepts an authHeader parameter.
func SendStudentAuthRequest(authHeader string, coursePhaseID uuid.UUID) (StudentAuthResponse, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	coreURL := utils.GetEnv("CORE_HOST", "localhost:3000")
	requestURL := "http://" + coreURL + "/api/course_phases/" + coursePhaseID.String() + "/participations/self"
	// Pass nil as the body for a GET request.
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		log.Println("Error creating request:", err)
		return StudentAuthResponse{}, err
	}

	req.Header.Set("Content-Type", "application/json")
	// Set the provided authentication header.
	req.Header.Set("Authorization", authHeader)

	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return StudentAuthResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Println("Received non-OK response:", resp.Status)
		return StudentAuthResponse{}, nil
	}

	var authResponse StudentAuthResponse
	err = json.NewDecoder(resp.Body).Decode(&authResponse)
	if err != nil {
		log.Println("Error decoding response body:", err)
		return StudentAuthResponse{}, err
	}

	return authResponse, nil
}
