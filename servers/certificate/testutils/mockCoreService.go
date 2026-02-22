package testutils

import (
	"net/http"
	"net/http/httptest"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func SetupMockCoreService() (*httptest.Server, func()) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Mock course phases endpoint
	router.GET("/api/course_phases/:id", func(c *gin.Context) {
		phaseID := c.Param("id")

		var courseID uuid.UUID
		switch phaseID {
		case "10000000-0000-0000-0000-000000000001":
			courseID = uuid.MustParse("20000000-0000-0000-0000-000000000001")
		default:
			courseID = uuid.MustParse("90000000-0000-0000-0000-000000000001")
		}

		c.JSON(http.StatusOK, gin.H{
			"id":       phaseID,
			"courseId": courseID.String(),
			"course": gin.H{
				"id":   courseID.String(),
				"name": "Test Course",
			},
		})
	})

	// Mock participations endpoint
	router.GET("/api/course_phases/:id/participations", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"coursePhaseParticipations": []gin.H{
				{
					"id":                    "40000000-0000-0000-0000-000000000001",
					"courseParticipationId": "50000000-0000-0000-0000-000000000001",
					"student": gin.H{
						"id":        "30000000-0000-0000-0000-000000000001",
						"firstName": "John",
						"lastName":  "Doe",
						"email":     "john.doe@example.com",
					},
				},
				{
					"id":                    "40000000-0000-0000-0000-000000000002",
					"courseParticipationId": "50000000-0000-0000-0000-000000000002",
					"student": gin.H{
						"id":        "30000000-0000-0000-0000-000000000002",
						"firstName": "Jane",
						"lastName":  "Smith",
						"email":     "jane.smith@example.com",
					},
				},
			},
		})
	})

	// Mock single participation endpoint
	router.GET("/api/course_phases/:id/participations/:studentID", func(c *gin.Context) {
		studentID := c.Param("studentID")

		c.JSON(http.StatusOK, gin.H{
			"id":                    "40000000-0000-0000-0000-000000000001",
			"courseParticipationId": "50000000-0000-0000-0000-000000000001",
			"student": gin.H{
				"id":        studentID,
				"firstName": "John",
				"lastName":  "Doe",
				"email":     "john.doe@example.com",
			},
		})
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
