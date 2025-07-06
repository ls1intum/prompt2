package copy

import (
	"github.com/gin-gonic/gin"
	"github.com/ls1intum/prompt-sdk/promptTypes"
)

func setupCopyRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	copyRouter := routerGroup.Group("")
	promptTypes.RegisterCopyEndpoint(copyRouter, authMiddleware(), &SelfTeamCopyHandler{})
}
