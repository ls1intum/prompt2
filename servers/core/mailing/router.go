package mailing

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/mailing/mailingDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func setupMailingRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	mailing := router.Group("/mailing", authMiddleware())
	mailing.PUT("/:coursePhaseID", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer, permissionValidation.CourseLecturer), sendStatusMailManualTrigger)
}

func sendStatusMailManualTrigger(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var mailingInfo mailingDTO.SendStatusMail
	if err := c.BindJSON(&mailingInfo); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	response, err := SendStatusMailManualTrigger(c, coursePhaseID, mailingInfo.StatusMailToBeSend)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, response)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
