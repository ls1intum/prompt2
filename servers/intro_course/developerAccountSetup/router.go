package developerAccountSetup

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
)

func setupDeveloperAccountSetupRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	accountSetup := router.Group("/developer_account")
	accountSetup.POST("/invite/:coursePhaseID/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUserHandler)
	accountSetup.POST("/invite_all/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUsersHandler)
	accountSetup.POST("/register_devices/:coursePhaseID/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerDevicesHandler)
	accountSetup.POST("/register_iphone/:coursePhaseID/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPhoneHandler)
	accountSetup.POST("/register_ipad/:coursePhaseID/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPadHandler)
	accountSetup.POST("/register_apple_watch/:coursePhaseID/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerAppleWatchHandler)
}

func inviteUserHandler(c *gin.Context) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID or courseParticipationID"})
		return
	}
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	err := HandleInviteUser(c, authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User invited successfully"})
}

func inviteUsersHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	authHeader := c.GetHeader("Authorization")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	results, err := InviteAllUsers(c, authHeader, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"results": results})
}

func registerDevicesHandler(c *gin.Context) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID or courseParticipationID"})
		return
	}
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	var req developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	results, err := RegisterAllDevices(c, authHeader, coursePhaseID, courseParticipationID, req.SemesterTag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"results": results})
}

func registerIPhoneHandler(c *gin.Context) {
	handleSingleDevice(c, "iPhone")
}

func registerIPadHandler(c *gin.Context) {
	handleSingleDevice(c, "iPad")
}

func registerAppleWatchHandler(c *gin.Context) {
	handleSingleDevice(c, "Apple Watch")
}

func handleSingleDevice(c *gin.Context, deviceType string) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID or courseParticipationID"})
		return
	}
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	var req developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := RegisterSingleDevice(c, authHeader, coursePhaseID, courseParticipationID, req.SemesterTag, deviceType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to register %s: %v", deviceType, err)})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": fmt.Sprintf("%s registered successfully", deviceType)})
}
