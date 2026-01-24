package copy

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
)

func SetupCopyRouter(router *gin.RouterGroup, service *CopyService) {
	copy := router.Group("/copy")
	{
		copy.POST("/:targetCoursePhaseID", promptSDK.AuthenticationMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), service.copyData)
	}
}

func (s *CopyService) copyData(c *gin.Context) {
	targetCoursePhaseID := c.Param("targetCoursePhaseID")
	targetUUID, err := uuid.Parse(targetCoursePhaseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target course phase ID"})
		return
	}

	var input struct {
		SourceCoursePhaseID string `json:"sourceCoursePhaseID" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sourceUUID, err := uuid.Parse(input.SourceCoursePhaseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source course phase ID"})
		return
	}

	if err := s.CopyData(c.Request.Context(), sourceUUID, targetUUID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data copied successfully"})
}
