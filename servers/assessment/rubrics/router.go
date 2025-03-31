package rubrics

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/rubrics/rubricDTO"
	log "github.com/sirupsen/logrus"
)

func setupRubricRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	rubricRouter := routerGroup.Group("/rubric")

	rubricRouter.GET("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getRubricsForCompetency)
	rubricRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createRubric)
	rubricRouter.PUT("/:rubricID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateRubric)
	rubricRouter.DELETE("/:rubricID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteRubric)
}

func getRubricsForCompetency(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	rubrics, err := GetRubricsForCompetency(c, competencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, rubrics)
}

func createRubric(c *gin.Context) {
	var request rubricDTO.CreateRubricRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := CreateRubric(c, request); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func updateRubric(c *gin.Context) {
	rubricID, err := uuid.Parse(c.Param("rubricID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request rubricDTO.UpdateRubricRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := UpdateRubric(c, rubricID, request); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func deleteRubric(c *gin.Context) {
	rubricID, err := uuid.Parse(c.Param("rubricID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := DeleteRubric(c, rubricID); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
