package coursePhaseConfig

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	log "github.com/sirupsen/logrus"
)

func setupCoursePhaseRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	coursePhaseRouter := routerGroup.Group("/config")

	coursePhaseRouter.GET("deadline", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getCoursePhaseDeadline)
	coursePhaseRouter.PUT("deadline", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateCoursePhaseDeadline)

	coursePhaseRouter.GET("teams", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getTeamsForCoursePhase)
}

func getCoursePhaseDeadline(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	deadline, err := GetCoursePhaseDeadline(c, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get course phase deadline")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve deadline"})
		return
	}

	c.JSON(http.StatusOK, deadline)
}

func updateCoursePhaseDeadline(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var request coursePhaseConfigDTO.UpdateDeadlineRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		log.WithError(err).Error("Failed to bind request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	err = UpdateCoursePhaseDeadline(c, coursePhaseID, request.Deadline)
	if err != nil {
		log.WithError(err).Error("Failed to update course phase deadline")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update deadline"})
		return
	}

	c.Status(http.StatusCreated)
}

func getTeamsForCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	teams, err := GetTeamsForCoursePhase(c, authHeader, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get teams for course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve teams"})
		return
	}

	c.JSON(http.StatusOK, teams)
}
