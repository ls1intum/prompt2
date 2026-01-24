package config

import (
	"net/http"

	"github.com/gin-gonic/gin"
	promptSDK "github.com/ls1intum/prompt-sdk"
)

func SetupConfigRouter(router *gin.RouterGroup, service *ConfigService) {
	config := router.Group("/config")
	{
		config.GET("", promptSDK.AuthenticationMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), service.getConfig)
	}
}

func (s *ConfigService) getConfig(c *gin.Context) {
	// Placeholder - return empty config for now
	c.JSON(http.StatusOK, gin.H{
		"coursePhaseID": c.Param("coursePhaseID"),
		"settings":      "{}",
	})
}
