package competencyMap

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyMap/competencyMapDTO"
	log "github.com/sirupsen/logrus"
)

func setupCompetencyMapRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	competencyMapRouter := routerGroup.Group("/competency-mappings")

	competencyMapRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), createCompetencyMapping)
	competencyMapRouter.DELETE("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), deleteCompetencyMapping)
	competencyMapRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAllCompetencyMappings)
	competencyMapRouter.GET("/from/:fromCompetencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getCompetencyMappings)
	competencyMapRouter.GET("/to/:toCompetencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getReverseCompetencyMappings)
	competencyMapRouter.GET("/evaluations/:fromCompetencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getEvaluationsByMappedCompetency)
}

func createCompetencyMapping(c *gin.Context) {
	var req competencyMapDTO.CreateCompetencyMappingRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err := CreateCompetencyMapping(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Competency mapping created successfully"})
}

func deleteCompetencyMapping(c *gin.Context) {
	var req competencyMapDTO.DeleteCompetencyMappingRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err := DeleteCompetencyMapping(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Competency mapping deleted successfully"})
}

func getAllCompetencyMappings(c *gin.Context) {
	mappings, err := GetAllCompetencyMappings(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, competencyMapDTO.GetCompetencyMappingsFromDBModels(mappings))
}

func getCompetencyMappings(c *gin.Context) {
	fromCompetencyID, err := uuid.Parse(c.Param("fromCompetencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	mappings, err := GetCompetencyMappings(c, fromCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, competencyMapDTO.GetCompetencyMappingsFromDBModels(mappings))
}

func getReverseCompetencyMappings(c *gin.Context) {
	toCompetencyID, err := uuid.Parse(c.Param("toCompetencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	mappings, err := GetReverseCompetencyMappings(c, toCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, competencyMapDTO.GetCompetencyMappingsFromDBModels(mappings))
}

func getEvaluationsByMappedCompetency(c *gin.Context) {
	fromCompetencyID, err := uuid.Parse(c.Param("fromCompetencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetEvaluationsByMappedCompetency(c, fromCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	// Note: You might want to convert these to DTOs if evaluation DTOs exist
	c.JSON(http.StatusOK, evaluations)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
