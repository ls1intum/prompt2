package jira_setup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type JiraClient struct {
	BaseURL  string
	Username string
	APIToken string
}

func NewJiraClient(baseURL, username, apiToken string) *JiraClient {
	return &JiraClient{
		BaseURL:  baseURL,
		Username: username,
		APIToken: apiToken,
	}
}

func (c *JiraClient) CreateGroup(groupName string) error {
	exists, err := c.groupExists(groupName)
	if err != nil {
		log.WithError(err).Errorf("failed to check if group exists")
		return err
	}

	if exists {
		log.Debug("Group %s already exists", groupName)
		return nil
	}

	err = c.createGroup(groupName)
	if err != nil {
		return fmt.Errorf("failed to create group: %w", err)
	}

	log.Infof("Group %s created successfully", groupName)
	return nil
}

// CreateGroup creates a new user group in Jira
func (c *JiraClient) createGroup(groupName string) error {
	url := fmt.Sprintf("%s/rest/api/2/group", c.BaseURL)

	payload := map[string]string{"name": groupName}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.SetBasicAuth(c.Username, c.APIToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	log.Debugf("Creating Jira Group %s Response status: %s", groupName, resp.Status)

	if resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to create group: %s", string(respBody))
	}

	return nil
}

// GroupExists checks if a group exists in Jira
func (c *JiraClient) groupExists(groupName string) (bool, error) {
	url := fmt.Sprintf("%s/rest/api/2/group?groupname=%s", c.BaseURL, groupName)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, fmt.Errorf("failed to create request: %w", err)
	}

	req.SetBasicAuth(c.Username, c.APIToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		return true, nil
	} else if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}

	respBody, _ := io.ReadAll(resp.Body)
	return false, fmt.Errorf("unexpected response: %s", string(respBody))
}

// AddUserToGroup adds a user to an existing group in Jira
func (c *JiraClient) AddUserToGroup(username, groupName string) error {
	url := fmt.Sprintf("%s/rest/api/2/group/user?groupname=%s", c.BaseURL, groupName)

	payload := map[string]string{"name": username}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.SetBasicAuth(c.Username, c.APIToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusNoContent {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to add user to group: %s", string(respBody))
	}

	return nil
}
