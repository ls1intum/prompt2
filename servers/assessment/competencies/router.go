package competencies

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
)

func setupCompetencyRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	competencyRouter := routerGroup.Group("/competency")

	competencyRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listCompetencies)
	competencyRouter.GET("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getCompetency)
	competencyRouter.GET("/category/:categoryID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listCompetenciesByCategory)
	competencyRouter.POST("", authMiddleware(promptSDK.PromptAdmin), createCompetency)
	competencyRouter.PUT("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateCompetency)
	competencyRouter.DELETE("/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteCompetency)
}

func listCompetencies(c *gin.Context) {
	competencies, err := ListCompetencies(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, competencyDTO.GetCompetencyDTOsFromDBModels(competencies))
}

func getCompetency(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	competency, err := GetCompetency(c, competencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, competencyDTO.GetCompetencyDTOsFromDBModels([]db.Competency{competency})[0])
}

func listCompetenciesByCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("categoryID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	competencies, err := ListCompetenciesByCategory(c, categoryID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, competencyDTO.GetCompetencyDTOsFromDBModels(competencies))
}

func createCompetency(c *gin.Context) {
	var req competencyDTO.CreateCompetencyRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err := CreateCompetency(c, req)
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
	var req competencyDTO.UpdateCompetencyRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err = UpdateCompetency(c, competencyID, req)
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
	if err := DeleteCompetency(c, competencyID); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
