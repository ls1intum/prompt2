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
	coursePhaseRouter := routerGroup.Group("/deadline")

	coursePhaseRouter.PUT("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateCoursePhaseDeadline)
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

	err = UpdateCoursePhaseDeadline(c.Request.Context(), coursePhaseID, request)
	if err != nil {
		log.WithError(err).Error("Failed to update course phase deadline")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update deadline"})
		return
	}

	response := coursePhaseConfigDTO.UpdateDeadlineResponse{
		Message: "Course phase deadline updated successfully",
	}
	c.JSON(http.StatusOK, response)
}
