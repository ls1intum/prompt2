package competencies

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	log "github.com/sirupsen/logrus"
)

// setupCompetencyRouter creates a router group for competency endpoints.
func setupCompetencyRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	competencyRouter := routerGroup.Group("/competency")

	competencyRouter.GET("/roots", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getRootCompetencies)
	competencyRouter.GET("/:superCompetencyID/sub", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getSubCompetencies)
	competencyRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createCompetency)
	competencyRouter.PUT("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateCompetency)
	competencyRouter.DELETE("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteCompetency)
}

func getRootCompetencies(c *gin.Context) {
	competencies, err := GetRootCompetencies(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, competencies)
}

func getSubCompetencies(c *gin.Context) {
	superCompetencyID, err := uuid.Parse(c.Param("superCompetencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	subs, err := GetSubCompetencies(c, superCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, subs)
}

func createCompetency(c *gin.Context) {
	var request competencyDTO.CreateCompetencyRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err := CreateCompetency(c, request.Name, request.Description, request.SuperCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func updateCompetency(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request competencyDTO.UpdateCompetencyRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateCompetency(c, competencyID, request.Name, request.Description, request.SuperCompetencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func deleteCompetency(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteCompetency(c, competencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
