package categories

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/categories/categoryDTO"
	log "github.com/sirupsen/logrus"
)

func setupCategoryRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	categoryRouter := routerGroup.Group("/category")

	categoryRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.PromptLecturer), getAllCategories)
	categoryRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.PromptLecturer), createCategory)
	categoryRouter.PUT("/:categoryID", authMiddleware(promptSDK.PromptAdmin), updateCategory)
	categoryRouter.DELETE("/:categoryID", authMiddleware(promptSDK.PromptAdmin), deleteCategory)
	categoryRouter.GET("/with-competencies", authMiddleware(promptSDK.PromptAdmin), getCategoriesWithCompetencies)
}

func getAllCategories(c *gin.Context) {
	categories, err := ListCategories(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, categories)
}

func createCategory(c *gin.Context) {
	var request categoryDTO.CreateCategoryRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	category, err := CreateCategory(c, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, category)
}

func updateCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("categoryID"))
	if err != nil {
		log.Error("Error parsing categoryID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request categoryDTO.UpdateCategoryRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	_, err = UpdateCategory(c, categoryID, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func deleteCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("categoryID"))
	if err != nil {
		log.Error("Error parsing categoryID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteCategory(c, categoryID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func getCategoriesWithCompetencies(c *gin.Context) {
	result, err := GetCategoriesWithCompetencies(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
