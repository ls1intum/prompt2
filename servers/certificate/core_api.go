package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
)

type CoreStudent struct {
	ID        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	TeamID    string `json:"teamId,omitempty"`
	TeamName  string `json:"teamName,omitempty"`
}

type CoursePhaseParticipation struct {
	ID                    string      `json:"id"`
	CourseParticipationID string      `json:"courseParticipationId"`
	Student               CoreStudent `json:"student"`
	TeamID                *string     `json:"teamId"`
	TeamName              *string     `json:"teamName"`
}

type CoursePhase struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CoreAPIClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewCoreAPIClient() *CoreAPIClient {
	coreHost := os.Getenv("CORE_HOST")
	if coreHost == "" {
		coreHost = "http://localhost:3000"
	}

	return &CoreAPIClient{
		baseURL: coreHost,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *CoreAPIClient) makeAuthenticatedRequest(ctx context.Context, method, url, token string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}

	return resp, nil
}

func (c *CoreAPIClient) GetCourseInfo(ctx context.Context, courseID uuid.UUID, token string) (string, error) {
	url := fmt.Sprintf("%s/api/course/%s", c.baseURL, courseID.String())

	resp, err := c.makeAuthenticatedRequest(ctx, "GET", url, token)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get course info: %s", resp.Status)
	}

	var course struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&course); err != nil {
		return "", fmt.Errorf("failed to decode course response: %w", err)
	}

	return course.Name, nil
}

func (c *CoreAPIClient) GetStudentsForCourse(ctx context.Context, courseID uuid.UUID, token string) ([]CertificateData, error) {
	// First, find the certificate course phase for this course
	coursePhaseID, err := c.findCertificateCoursePhase(ctx, courseID, token)
	if err != nil {
		return nil, fmt.Errorf("failed to find certificate course phase: %w", err)
	}

	// Get course info for course name
	courseName, err := c.GetCourseInfo(ctx, courseID, token)
	if err != nil {
		// Use a fallback course name if we can't get it
		courseName = "Course"
	}

	// Get all participations for the certificate course phase
	url := fmt.Sprintf("%s/api/course-phase-participation/%s", c.baseURL, coursePhaseID.String())

	resp, err := c.makeAuthenticatedRequest(ctx, "GET", url, token)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get course phase participations: %s, body: %s", resp.Status, string(body))
	}

	var participationsWrapper struct {
		CoursePhaseParticipations []CoursePhaseParticipation `json:"coursePhaseParticipations"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&participationsWrapper); err != nil {
		return nil, fmt.Errorf("failed to decode participations response: %w", err)
	}

	// Convert to CertificateData
	var students []CertificateData
	for _, participation := range participationsWrapper.CoursePhaseParticipations {
		teamName := "No Team"
		if participation.TeamName != nil && *participation.TeamName != "" {
			teamName = *participation.TeamName
		}

		studentName := fmt.Sprintf("%s %s", participation.Student.FirstName, participation.Student.LastName)

		students = append(students, CertificateData{
			StudentID:   participation.Student.ID,
			StudentName: studentName,
			TeamName:    teamName,
			CourseName:  courseName,
		})
	}

	return students, nil
}

func (c *CoreAPIClient) findCertificateCoursePhase(ctx context.Context, courseID uuid.UUID, token string) (uuid.UUID, error) {
	url := fmt.Sprintf("%s/api/course/%s/course-phase", c.baseURL, courseID.String())

	resp, err := c.makeAuthenticatedRequest(ctx, "GET", url, token)
	if err != nil {
		return uuid.Nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return uuid.Nil, fmt.Errorf("failed to get course phases: %s", resp.Status)
	}

	var coursePhases []CoursePhase
	if err := json.NewDecoder(resp.Body).Decode(&coursePhases); err != nil {
		return uuid.Nil, fmt.Errorf("failed to decode course phases response: %w", err)
	}

	// Look for a course phase with "Certificate" in the name
	for _, phase := range coursePhases {
		if phase.Name == "Certificate" {
			phaseID, err := uuid.Parse(phase.ID)
			if err != nil {
				continue
			}
			return phaseID, nil
		}
	}

	return uuid.Nil, fmt.Errorf("certificate course phase not found for course %s", courseID.String())
}

// GetTokenFromContext extracts the authentication token from the Gin context
func GetTokenFromContext(c interface{}) (string, error) {
	// Extract token from Authorization header
	// This assumes the token is passed in the request that triggered certificate generation
	// For async generation, we'd need to store and pass the token differently

	// For now, return a placeholder error - in production, this would need proper token handling
	// One approach would be to use a service account token for internal API calls
	return "", fmt.Errorf("token extraction not yet implemented for async operations")
}
