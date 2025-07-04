package assessmentTemplates

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentTemplates/assessmentTemplateDTO"
	log "github.com/sirupsen/logrus"
)

func SetupAssessmentTemplateRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	templateRouter := routerGroup.Group("/assessment-template")

	templateRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAllAssessmentTemplates)
	templateRouter.GET("/:templateID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAssessmentTemplate)
	templateRouter.POST("", authMiddleware(promptSDK.PromptAdmin), createAssessmentTemplate)
	templateRouter.PUT("/:templateID", authMiddleware(promptSDK.PromptAdmin), updateAssessmentTemplate)
	templateRouter.DELETE("/:templateID", authMiddleware(promptSDK.PromptAdmin), deleteAssessmentTemplate)
}

func getAllAssessmentTemplates(c *gin.Context) {
	templates, err := ListAssessmentTemplates(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, templates)
}

func getAssessmentTemplate(c *gin.Context) {
	templateIDStr := c.Param("templateID")
	templateID, err := uuid.Parse(templateIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	template, err := GetAssessmentTemplate(c, templateID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, template)
}

func createAssessmentTemplate(c *gin.Context) {
	var request assessmentTemplateDTO.CreateAssessmentTemplateRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	template, err := CreateAssessmentTemplate(c, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, template)
}

func updateAssessmentTemplate(c *gin.Context) {
	templateIDStr := c.Param("templateID")
	templateID, err := uuid.Parse(templateIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request assessmentTemplateDTO.UpdateAssessmentTemplateRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateAssessmentTemplate(c, templateID, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assessment template updated successfully"})
}

func deleteAssessmentTemplate(c *gin.Context) {
	templateIDStr := c.Param("templateID")
	templateID, err := uuid.Parse(templateIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteAssessmentTemplate(c, templateID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assessment template deleted successfully"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.WithError(err).Error("Error in assessment template handler")
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
