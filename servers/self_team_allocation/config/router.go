package config

import (
	"github.com/gin-gonic/gin"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
)

func setupConfigRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	promptTypes.RegisterConfigEndpoint(routerGroup, authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), &ConfigHandler{})
}
