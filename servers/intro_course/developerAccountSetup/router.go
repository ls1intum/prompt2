package developerAccountSetup

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
	log "github.com/sirupsen/logrus"
)

func setupDeveloperAccountSetupRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	accountSetup := router.Group("/developer_account")

	accountSetup.POST("/invite/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUserHandler)
	accountSetup.POST("/invite-all", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUsersHandler)

	accountSetup.POST("/register-devices/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerDevicesHandler)

	accountSetup.POST("/register-iphone/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPhoneHandler)
	accountSetup.POST("/register-ipad/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPadHandler)
	accountSetup.POST("/register-apple-watch/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerAppleWatchHandler)

	accountSetup.GET("/status", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getAllStudentAppleStatus)

	accountSetup.PUT("/:courseParticipationID/manual", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), manuallyOverwriteStudentAppleStatus)
}

func inviteUserHandler(c *gin.Context) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil {
		handleError(c, http.StatusBadRequest, err1)
		return
	}
	if err2 != nil {
		handleError(c, http.StatusBadRequest, err2)
		return
	}
	if authHeader == "" {
		handleError(c, http.StatusUnauthorized, fmt.Errorf("missing Authorization header"))
		return
	}

	err := HandleInviteUser(c, authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "User invited successfully"})
}

func inviteUsersHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	authHeader := c.GetHeader("Authorization")

	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	if authHeader == "" {
		handleError(c, http.StatusUnauthorized, fmt.Errorf("missing Authorization header"))
		return
	}

	results, err := InviteAllUsers(c, authHeader, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"results": results})
}

func registerDevicesHandler(c *gin.Context) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil {
		handleError(c, http.StatusBadRequest, err1)
		return
	}
	if err2 != nil {
		handleError(c, http.StatusBadRequest, err2)
		return
	}
	if authHeader == "" {
		handleError(c, http.StatusUnauthorized, fmt.Errorf("missing Authorization header"))
		return
	}

	var req developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	results, err := RegisterAllDevices(c, authHeader, coursePhaseID, courseParticipationID, req.SemesterTag)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"results": results})
}

func registerIPhoneHandler(c *gin.Context) {
	registerSingleDeviceHandler(c, "iPhone")
}

func registerIPadHandler(c *gin.Context) {
	registerSingleDeviceHandler(c, "iPad")
}

func registerAppleWatchHandler(c *gin.Context) {
	registerSingleDeviceHandler(c, "Apple Watch")
}

func registerSingleDeviceHandler(c *gin.Context, deviceType string) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil {
		handleError(c, http.StatusBadRequest, err1)
		return
	}
	if err2 != nil {
		handleError(c, http.StatusBadRequest, err2)
		return
	}
	if authHeader == "" {
		handleError(c, http.StatusUnauthorized, fmt.Errorf("missing Authorization header"))
		return
	}

	var req developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err := RegisterSingleDevice(c, authHeader, coursePhaseID, courseParticipationID, req.SemesterTag, deviceType)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": fmt.Sprintf("%s registered successfully", deviceType)})
}

func getAllStudentAppleStatus(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	studentAppleStatus, err := GetAllStudentAppleStatus(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, studentAppleStatus)
}

func manuallyOverwriteStudentAppleStatus(c *gin.Context) {
	coursePhaseID, err1 := uuid.Parse(c.Param("coursePhaseID"))
	courseParticipationID, err2 := uuid.Parse(c.Param("courseParticipationID"))
	authHeader := c.GetHeader("Authorization")

	if err1 != nil {
		handleError(c, http.StatusBadRequest, err1)
		return
	}
	if err2 != nil {
		handleError(c, http.StatusBadRequest, err2)
		return
	}
	if authHeader == "" {
		handleError(c, http.StatusUnauthorized, fmt.Errorf("missing Authorization header"))
		return
	}

	err := ManuallyOverwriteStudentAppleStatus(c, coursePhaseID, courseParticipationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully overwritten student apple status"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
