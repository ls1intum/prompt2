package assessmentSchemas

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentSchemas/assessmentSchemaDTO"
	log "github.com/sirupsen/logrus"
)

func SetupAssessmentSchemaRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	schemaRouter := routerGroup.Group("/assessment-schema")

	schemaRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAllAssessmentSchemas)
	schemaRouter.GET("/:schemaID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAssessmentSchema)
	schemaRouter.POST("", authMiddleware(promptSDK.PromptAdmin), createAssessmentSchema)
	schemaRouter.PUT("/:schemaID", authMiddleware(promptSDK.PromptAdmin), updateAssessmentSchema)
	schemaRouter.DELETE("/:schemaID", authMiddleware(promptSDK.PromptAdmin), deleteAssessmentSchema)
}

func getAllAssessmentSchemas(c *gin.Context) {
	schemas, err := ListAssessmentSchemas(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, schemas)
}

func getAssessmentSchema(c *gin.Context) {
	schemaIDStr := c.Param("schemaID")
	schemaID, err := uuid.Parse(schemaIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	schema, err := GetAssessmentSchema(c, schemaID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, schema)
}

func createAssessmentSchema(c *gin.Context) {
	var request assessmentSchemaDTO.CreateAssessmentSchemaRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	schema, err := CreateAssessmentSchema(c, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, schema)
}

func updateAssessmentSchema(c *gin.Context) {
	schemaIDStr := c.Param("schemaID")
	schemaID, err := uuid.Parse(schemaIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request assessmentSchemaDTO.UpdateAssessmentSchemaRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateAssessmentSchema(c, schemaID, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assessment schema updated successfully"})
}

func deleteAssessmentSchema(c *gin.Context) {
	schemaIDStr := c.Param("schemaID")
	schemaID, err := uuid.Parse(schemaIDStr)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteAssessmentSchema(c, schemaID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Assessment schema deleted successfully"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.WithError(err).Error("Error in assessment schema handler")
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
