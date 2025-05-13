package confluence_setup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type ConfluenceClient struct {
	BaseURL  string
	Username string
	APIToken string
}

func NewConfluenceClient(baseURL, username, apiToken string) *ConfluenceClient {
	return &ConfluenceClient{
		BaseURL:  baseURL,
		Username: username,
		APIToken: apiToken,
	}
}

var (
	AdminPermissions = []map[string]string{
		{"targetType": "space", "operationKey": "read"},
		{"targetType": "space", "operationKey": "administer"},
		{"targetType": "space", "operationKey": "export"},
		{"targetType": "space", "operationKey": "restrict"},
		{"targetType": "space", "operationKey": "delete_own"},
		{"targetType": "space", "operationKey": "delete_mail"},
		{"targetType": "page", "operationKey": "create"},
		{"targetType": "page", "operationKey": "delete"},
		{"targetType": "blogpost", "operationKey": "create"},
		{"targetType": "blogpost", "operationKey": "delete"},
		{"targetType": "comment", "operationKey": "create"},
		{"targetType": "comment", "operationKey": "delete"},
		{"targetType": "attachment", "operationKey": "create"},
		{"targetType": "attachment", "operationKey": "delete"},
	}

	UserPermissions = []map[string]string{
		{"targetType": "space", "operationKey": "read"},
		{"targetType": "space", "operationKey": "delete_own"},
		{"targetType": "page", "operationKey": "create"},
		{"targetType": "page", "operationKey": "delete"},
		{"targetType": "blogpost", "operationKey": "create"},
		{"targetType": "comment", "operationKey": "create"},
		{"targetType": "attachment", "operationKey": "create"},
	}
)

// CreateSpace creates a new space in Confluence
func (c *ConfluenceClient) CreateSpace(spaceKey, spaceName string) error {
	// Check if the space already exists
	exists, err := c.SpaceExists(spaceKey)
	if err != nil {
		return fmt.Errorf("failed to check if space exists: %w", err)
	}

	if exists {
		log.Infof("Space with key %s already exists, skipping creation", spaceKey)
		return nil
	}

	// Proceed to create the space if it does not exist
	url := fmt.Sprintf("%s/rest/api/space", c.BaseURL)

	payload := map[string]string{
		"key":  spaceKey,
		"name": spaceName,
	}
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

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to create space: %s", string(respBody))
	}

	log.Infof("Space %s created successfully", spaceName)
	return nil
}

// SpaceExists checks if a space exists in Confluence
func (c *ConfluenceClient) SpaceExists(spaceKey string) (bool, error) {
	url := fmt.Sprintf("%s/rest/api/space/%s", c.BaseURL, spaceKey)

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

// AddSpaceToCategory adds a space to a specific category in Confluence
func (c *ConfluenceClient) AddSpaceToCategory(spaceKey, category string) error {
	url := fmt.Sprintf("%s/rest/api/space/%s/category", c.BaseURL, spaceKey)

	payload := []string{category}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(body))
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

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		log.Errorf("Failed to add space to category. Status: %d, Response: %s", resp.StatusCode, string(respBody))
		return fmt.Errorf("failed to add space to category: %s", string(respBody))
	}

	log.Infof("Space %s added to category %s successfully", spaceKey, category)
	return nil
}

func (c *ConfluenceClient) AssignGroupPermissions(spaceKey, groupName string, permissions []map[string]string) error {
	// Check if the space exists
	exists, err := c.SpaceExists(spaceKey)
	if err != nil {
		return fmt.Errorf("failed to check if space exists: %w", err)
	}

	if !exists {
		return fmt.Errorf("space with key %s does not exist", spaceKey)
	}

	// Proceed to assign permissions
	url := fmt.Sprintf("%s/rest/api/space/%s/permissions/group/%s/grant", c.BaseURL, spaceKey, groupName)

	body, err := json.Marshal(permissions)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(body))
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

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		log.Errorf("Failed to assign permissions. Status: %d, Response: %s", resp.StatusCode, string(respBody))
		return fmt.Errorf("failed to assign permissions: %s", string(respBody))
	}

	log.Infof("Permissions assigned successfully to group %s for space %s", groupName, spaceKey)
	return nil
}
