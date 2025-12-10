package utils

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
)

// GetCourseIdentifierFromPhase retrieves the course identifier (name + semester_tag) from a course phase
func GetCourseIdentifierFromPhase(ctx context.Context, coursePhaseID uuid.UUID) (string, error) {
	coreURL := GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s", coreURL, coursePhaseID.String())

	// Extract auth token from gin context
	authToken := ""
	if ginCtx, ok := ctx.(*gin.Context); ok {
		authToken = ginCtx.GetHeader("Authorization")
	}

	data, err := promptSDK.FetchJSON(url, authToken)
	if err != nil {
		return "", fmt.Errorf("failed to fetch course phase: %w", err)
	}

	var coursePhase struct {
		CourseID uuid.UUID `json:"courseID"`
	}
	if err := json.Unmarshal(data, &coursePhase); err != nil {
		return "", fmt.Errorf("failed to unmarshal course phase: %w", err)
	}

	// Now fetch the course information
	courseURL := fmt.Sprintf("%s/api/courses/%s", coreURL, coursePhase.CourseID.String())
	courseData, err := promptSDK.FetchJSON(courseURL, authToken)
	if err != nil {
		return "", fmt.Errorf("failed to fetch course: %w", err)
	}

	var course struct {
		Name        string `json:"name"`
		SemesterTag string `json:"semesterTag"`
	}
	if err := json.Unmarshal(courseData, &course); err != nil {
		return "", fmt.Errorf("failed to unmarshal course: %w", err)
	}

	return fmt.Sprintf("%s%s", course.Name, course.SemesterTag), nil
}
