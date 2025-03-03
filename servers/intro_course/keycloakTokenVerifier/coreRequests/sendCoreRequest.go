package coreRequests

import (
	"io"
	"net/http"
	"time"

	"github.com/ls1intum/prompt2/servers/intro_course/utils"
	log "github.com/sirupsen/logrus"
)

func sendRequest(method, subURL, authHeader string, body io.Reader) (*http.Response, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	coreURL := utils.GetCoreUrl()
	requestURL := coreURL + subURL
	req, err := http.NewRequest(method, requestURL, body)
	if err != nil {
		log.Error("Error creating request:", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("Error sending request:", err)
		return nil, err
	}

	return resp, nil
}
