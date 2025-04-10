package coreRequests

import (
	"encoding/json"

	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/team_allocation/coreRequests/coreRequestDTO"
)

func GetCourses(coreURL string, authHeader string) ([]coreRequestDTO.Course, error) {
	path := "/api/courses/"
	url := coreURL + path

	data, err := promptSDK.FetchJSON(url, authHeader)
	if err != nil {
		return nil, err
	}

	var results []coreRequestDTO.Course
	if err := json.Unmarshal(data, &results); err != nil {
		return nil, err
	}

	return results, nil
}
