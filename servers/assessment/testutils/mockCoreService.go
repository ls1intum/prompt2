package testutils

import (
	"net/http"
	"net/http/httptest"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MockCoursePhaseResponse struct {
	CourseID uuid.UUID `json:"courseID"`
}

type MockCourseResponse struct {
	Name        string `json:"name"`
	SemesterTag string `json:"semesterTag"`
}

func SetupMockCoreService() (*httptest.Server, func()) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Mock course phases endpoint
	router.GET("/api/course_phases/:id", func(c *gin.Context) {
		phaseID := c.Param("id")

		// Map known test phase IDs to course IDs
		var courseID uuid.UUID
		switch phaseID {
		case "10000000-0000-0000-0000-000000000001":
			courseID = uuid.MustParse("20000000-0000-0000-0000-000000000001")
		case "10000000-0000-0000-0000-000000000002":
			courseID = uuid.MustParse("20000000-0000-0000-0000-000000000001")
		case "10000000-0000-0000-0000-000000000003":
			courseID = uuid.MustParse("20000000-0000-0000-0000-000000000001")
		case "10000000-0000-0000-0000-000000000004":
			courseID = uuid.MustParse("20000000-0000-0000-0000-000000000001")
		case "4179d58a-d00d-4fa7-94a5-397bc69fab02":
			courseID = uuid.MustParse("30000000-0000-0000-0000-000000000001")
		default:
			// Default course ID for any other phase
			courseID = uuid.MustParse("90000000-0000-0000-0000-000000000001")
		}

		response := MockCoursePhaseResponse{
			CourseID: courseID,
		}
		c.JSON(http.StatusOK, response)
	})

	router.GET("/api/courses/:id", func(c *gin.Context) {
		courseID := c.Param("id")

		var name, semesterTag string
		switch courseID {
		case "20000000-0000-0000-0000-000000000001":
			name = "ios"
			semesterTag = "2526"
		case "30000000-0000-0000-0000-000000000001":
			name = "testcourse"
			semesterTag = "2425"
		default:
			name = "defaultcourse"
			semesterTag = "2526"
		}

		response := MockCourseResponse{
			Name:        name,
			SemesterTag: semesterTag,
		}
		c.JSON(http.StatusOK, response)
	})

	server := httptest.NewServer(router)

	oldCoreHost := os.Getenv("SERVER_CORE_HOST")
	_ = os.Setenv("SERVER_CORE_HOST", server.URL)

	cleanup := func() {
		server.Close()
		if oldCoreHost != "" {
			_ = os.Setenv("SERVER_CORE_HOST", oldCoreHost)
		} else {
			_ = os.Unsetenv("SERVER_CORE_HOST")
		}
	}

	return server, cleanup
}

func GetMockCourseIdentifier(coursePhaseID uuid.UUID) string {
	switch coursePhaseID.String() {
	case "10000000-0000-0000-0000-000000000001",
		"10000000-0000-0000-0000-000000000002",
		"10000000-0000-0000-0000-000000000003",
		"10000000-0000-0000-0000-000000000004":
		return "mockedios2526"
	case "4179d58a-d00d-4fa7-94a5-397bc69fab02":
		return "testcourse2425"
	default:
		return "defaultcourse2526"
	}
}
