package copy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt-sdk/promptTypes"
	"github.com/ls1intum/prompt2/servers/core/utils"
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
		pt, err := CourseCopyServiceSingleton.queries.GetCoursePhaseTypeByID(c, p.CoursePhaseTypeID)
		if err != nil {
			return nil, fmt.Errorf("failed to get phase type: %w", err)
		}

		// Skip internal/core phases
		if pt.BaseUrl == utils.GetEnv("CORE_HOST", "core") {
			continue
		}

		if _, seen := checked[pt.BaseUrl]; seen {
			continue
		}

		// send a dummy POST request to the copy endpoint to check if it exists
		body, _ := json.Marshal(promptTypes.PhaseCopyRequest{
			SourceCoursePhaseID: p.ID,
			TargetCoursePhaseID: p.ID,
		})

		resp, err := sendRequest("POST", c.GetHeader("Authorization"), bytes.NewBuffer(body), pt.BaseUrl+"/copy")
		if err != nil {
			log.Warnf("Error checking copy endpoint for phase '%s': %v", pt.Name, err)
			missing = append(missing, p.Name.String+" ("+pt.Name+")")
			checked[pt.BaseUrl] = pt.Name
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == http.StatusNotFound {
			missing = append(missing, p.Name.String+" ("+pt.Name+")")
		}
		checked[pt.BaseUrl] = pt.Name
	}

	for _, p := range unordered {
		pt, err := CourseCopyServiceSingleton.queries.GetCoursePhaseTypeByID(c, p.CoursePhaseTypeID)
		if err != nil {
			return nil, fmt.Errorf("failed to get phase type: %w", err)
		}

		// Skip internal/core phases
		if pt.BaseUrl == utils.GetEnv("CORE_HOST", "core") {
			continue
		}

		if _, seen := checked[pt.BaseUrl]; seen {
			continue
		}

		// send a dummy POST request to the copy endpoint to check if it exists
		body, _ := json.Marshal(promptTypes.PhaseCopyRequest{
			SourceCoursePhaseID: p.ID,
			TargetCoursePhaseID: p.ID,
		})

		resp, err := sendRequest("POST", c.GetHeader("Authorization"), bytes.NewBuffer(body), pt.BaseUrl+"/copy")
		if err != nil {
			log.Warnf("Error checking copy endpoint for phase '%s': %v", pt.Name, err)
			missing = append(missing, p.Name.String+" ("+pt.Name+")")
			checked[pt.BaseUrl] = pt.Name
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == http.StatusNotFound {
			missing = append(missing, p.Name.String+" ("+pt.Name+")")
		}
		checked[pt.BaseUrl] = pt.Name
	}

	return missing, nil
}
