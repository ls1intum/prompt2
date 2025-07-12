package copy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	log "github.com/sirupsen/logrus"
)

// checkAllCoursePhasesCopyable checks if all course phases from the source course can be copied to the target course.
func checkAllCoursePhasesCopyable(c *gin.Context, sourceCourseID uuid.UUID) ([]string, error) {
	sequence, err := CourseCopyServiceSingleton.queries.GetCoursePhaseSequence(c, sourceCourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course phase sequence: %w", err)
	}
	unordered, err := CourseCopyServiceSingleton.queries.GetNotOrderedCoursePhases(c, sourceCourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get unordered course phases: %w", err)
	}

	// Track seen base URLs to avoid duplicate requests
	checked := make(map[string]string) // baseUrl => phaseTypeName (for reporting)
	missing := []string{}

	for _, p := range sequence {
		if err := checkPhaseCopyable(c, p.ID, p.CoursePhaseTypeID, p.Name.String, checked, &missing); err != nil {
			return nil, fmt.Errorf("failed to check phase copyable: %w", err)
		}
	}

	for _, p := range unordered {
		if err := checkPhaseCopyable(c, p.ID, p.CoursePhaseTypeID, p.Name.String, checked, &missing); err != nil {
			return nil, fmt.Errorf("failed to check phase copyable: %w", err)
		}
	}

	return missing, nil
}

// checkPhaseCopyable checks if a single course phase can be copied by sending a dummy request to the copy endpoint.
func checkPhaseCopyable(c *gin.Context, phaseID, phaseTypeID uuid.UUID, phaseName string, checked map[string]string, missing *[]string) error {
	pt, err := CourseCopyServiceSingleton.queries.GetCoursePhaseTypeByID(c, phaseTypeID)
	if err != nil {
		return fmt.Errorf("failed to get phase type: %w", err)
	}

	if pt.BaseUrl == "core" {
		return nil
	}

	// Replace {CORE_HOST} before parsing the URL
	baseURL := strings.ReplaceAll(
		pt.BaseUrl,
		"{CORE_HOST}",
		promptSDK.GetEnv("SERVER_CORE_HOST", "http://localhost:8080"),
	)

	// Parse and validate the resulting URL
	parsedBase, err := url.Parse(baseURL)
	if err != nil {
		return fmt.Errorf("invalid base URL after env substitution: %w", err)
	}
	if parsedBase.Scheme == "" || parsedBase.Host == "" {
		return fmt.Errorf("invalid base URL (missing scheme or host): %s", baseURL)
	}

	// Join with the /copy path
	parsedBase.Path, err = url.JoinPath(parsedBase.Path, "copy")
	if err != nil {
		return fmt.Errorf("failed to join path: %w", err)
	}
	urlStr := parsedBase.String()

	// Don't send copy requests to core itself
	coreHost := promptSDK.GetEnv("SERVER_CORE_HOST", "http://localhost:8080")
	if urlStr == coreHost+"/copy" {
		return nil
	}

	if _, seen := checked[pt.BaseUrl]; seen {
		return nil
	}

	// send a dummy POST request to the copy endpoint to check if it exists
	body, _ := json.Marshal(promptTypes.PhaseCopyRequest{
		SourceCoursePhaseID: phaseID,
		TargetCoursePhaseID: phaseID,
	})

	resp, err := sendRequest("POST", c.GetHeader("Authorization"), bytes.NewBuffer(body), urlStr)
	if err != nil {
		log.Warnf("Error checking copy endpoint for phase '%s': %v", pt.Name, err)
		*missing = append(*missing, phaseName+" ("+pt.Name+")"+" URL request was sent to: "+urlStr)
		checked[pt.BaseUrl] = pt.Name
		return nil
	}
	resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		*missing = append(*missing, phaseName+" ("+pt.Name+")")
	}
	checked[pt.BaseUrl] = pt.Name
	return nil
}
