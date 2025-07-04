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

	coursePhaseRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getCoursePhaseConfig)

	coursePhaseRouter.PUT("deadline", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateCoursePhaseDeadline)
	coursePhaseRouter.PUT("self-assessment-deadline", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateSelfAssessmentDeadline)
	coursePhaseRouter.PUT("peer-assessment-deadline", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updatePeerAssessmentDeadline)

	coursePhaseRouter.POST("assessment-template", authMiddleware(promptSDK.PromptAdmin), createOrUpdateAssessmentTemplateCoursePhase)
	coursePhaseRouter.POST("self-assessment-template", authMiddleware(promptSDK.PromptAdmin), createOrUpdateSelfAssessmentTemplateCoursePhase)
	coursePhaseRouter.POST("peer-assessment-template", authMiddleware(promptSDK.PromptAdmin), createOrUpdatePeerAssessmentTemplateCoursePhase)

	coursePhaseRouter.GET("participations", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getParticipationsForCoursePhase)
	coursePhaseRouter.GET("teams", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getTeamsForCoursePhase)

}

func getCoursePhaseConfig(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	config, err := GetCoursePhaseConfig(c, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get course phase config")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve course phase config"})
		return
	}

	c.JSON(http.StatusOK, coursePhaseConfigDTO.MapDBCoursePhaseConfigToDTOCoursePhaseConfig(config))
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

func updateSelfAssessmentDeadline(c *gin.Context) {
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

	err = UpdateSelfAssessmentDeadline(c, coursePhaseID, request.Deadline)
	if err != nil {
		log.WithError(err).Error("Failed to update self assessment deadline")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update self assessment deadline"})
		return
	}

	c.Status(http.StatusCreated)
}

func updatePeerAssessmentDeadline(c *gin.Context) {
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

	err = UpdatePeerAssessmentDeadline(c, coursePhaseID, request.Deadline)
	if err != nil {
		log.WithError(err).Error("Failed to update peer assessment deadline")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update peer assessment deadline"})
		return
	}

	c.Status(http.StatusCreated)
}

func createOrUpdateAssessmentTemplateCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var request coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest
	if err := c.BindJSON(&request); err != nil {
		log.WithError(err).Error("Failed to bind request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	err = CreateOrUpdateAssessmentTemplateCoursePhase(c, coursePhaseID, request)
	if err != nil {
		log.WithError(err).Error("Failed to create or update assessment template course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create or update assessment template course phase"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assessment template course phase created/updated successfully"})
}

func createOrUpdateSelfAssessmentTemplateCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var request coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest
	if err := c.BindJSON(&request); err != nil {
		log.WithError(err).Error("Failed to bind request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	err = CreateOrUpdateSelfAssessmentTemplateCoursePhase(c, coursePhaseID, request)
	if err != nil {
		log.WithError(err).Error("Failed to create or update self assessment template course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create or update self assessment template course phase"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Self assessment template course phase created/updated successfully"})
}

func createOrUpdatePeerAssessmentTemplateCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var request coursePhaseConfigDTO.CreateOrUpdateAssessmentTemplateRequest
	if err := c.BindJSON(&request); err != nil {
		log.WithError(err).Error("Failed to bind request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	err = CreateOrUpdatePeerAssessmentTemplateCoursePhase(c, coursePhaseID, request)
	if err != nil {
		log.WithError(err).Error("Failed to create or update peer assessment template course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create or update peer assessment template course phase"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Peer assessment template course phase created/updated successfully"})
}

func getParticipationsForCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.WithError(err).Error("Failed to parse course phase ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	participations, err := GetParticipationsForCoursePhase(c, authHeader, coursePhaseID)
	if err != nil {
		log.WithError(err).Error("Failed to get participations for course phase")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve participations"})
		return
	}

	c.JSON(http.StatusOK, participations)
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
