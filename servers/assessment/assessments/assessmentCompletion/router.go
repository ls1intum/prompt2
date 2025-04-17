package assessmentCompletion

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	log "github.com/sirupsen/logrus"
)

func setupAssessmentCompletionRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	assessmentRouter := routerGroup.Group("/student-assessment/completed")

	assessmentRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), markAssessmenAsComplete)
	assessmentRouter.GET("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAssessmentCompletion)
	assessmentRouter.DELETE("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), unmarkAssessmentAsCompleted)
}

func markAssessmenAsComplete(c *gin.Context) {
	var req assessmentCompletionDTO.AssessmentCompletion
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err := MarkAssessmentAsCompleted(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Assessment created successfully"})
}

func unmarkAssessmentAsCompleted(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	if err := UnmarkAssessmentAsCompleted(c, courseParticipationID, coursePhaseID); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func getAssessmentCompletion(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessmentCompletion, err := GetAssessmentCompletion(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentCompletion)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
