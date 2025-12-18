package copy

import (
	"github.com/gin-gonic/gin"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt-sdk/promptTypes"
)

func setupCopyRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	promptTypes.RegisterCopyEndpoint(routerGroup, authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), &AssessmentCopyHandler{})
}
