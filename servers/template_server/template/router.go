package template

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	log "github.com/sirupsen/logrus"
)

// setupTemplateRouter creates a router group for template server endpoints.
func setupTemplateRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	templateRouter := routerGroup.Group("info")

	templateRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getTemplateInfo)
}

func getTemplateInfo(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	templateInfo, err := GetTemplateInfo(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, templateInfo)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
