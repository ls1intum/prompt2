package developerAccountSetup

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
	"github.com/ls1intum/prompt2/servers/intro_course/developerAccountSetup/developerAccountSetupDTO"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
	log "github.com/sirupsen/logrus"
)

func setupDeveloperAccountSetupRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	accountSetup := router.Group("/developer_account")
	accountSetup.POST("/invite/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUserHandler)
	accountSetup.POST("/invite_all/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), inviteUsersHandler)
	accountSetup.POST("/register_devices/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerDevicesHandler)
	accountSetup.POST("/register_iphone/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPhoneHandler)
	accountSetup.POST("/register_ipad/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerIPadHandler)
	accountSetup.POST("/register_apple_watch/:coursePhaseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), registerAppleWatchHandler)
}

func inviteUserHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	devProfile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	err = InviteUser(c, coursePhaseID, courseParticipationID, devProfile.AppleID, student.FirstName, student.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite user: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User invited successfully"})
}

func inviteUsersHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	coreURL := utils.GetCoreUrl()
	participations, err := promptSDK.FetchAndMergeParticipationsWithResolutions(coreURL, authHeader, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get course phase participations"})
		return
	}

	results, err := InviteUsers(c, coursePhaseID, participations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite users"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"results": results})
}

func registerDevicesHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	// get semester tag
	var addDeviceRequest developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&addDeviceRequest); err != nil {
		log.Error("Error binding JSON: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Extract student details
	appleWatchUDID := developerprofile.AppleWatchUDID
	iPhoneUDID := developerprofile.IPhoneUDID
	iPadUDID := developerprofile.IPadUDID

	studentLastName := student.LastName
	semesterTag := addDeviceRequest.SemesterTag

	devices := []struct {
		Name string
		UDID pgtype.Text
	}{
		{Name: semesterTag + "-" + studentLastName + "-" + "Apple Watch", UDID: appleWatchUDID},
		{Name: semesterTag + "-" + studentLastName + "-" + "iPhone", UDID: iPhoneUDID},
		{Name: semesterTag + "-" + studentLastName + "-" + "iPad", UDID: iPadUDID},
	}

	var results []struct {
		DeviceName   string `json:"deviceName"`
		ErrorMessage string `json:"errorMessage"`
	}

	for _, device := range devices {
		deviceName := device.Name
		deviceUDIDValid := device.UDID.Valid
		if deviceUDIDValid {
			deviceUDID := device.UDID.String
			platform := "IOS"
			err = RegisterDevice(c, coursePhaseID, courseParticipationID, deviceName, deviceUDID, platform)
			if err != nil {
				results = append(results, struct {
					DeviceName   string `json:"deviceName"`
					ErrorMessage string `json:"errorMessage"`
				}{
					DeviceName:   deviceName,
					ErrorMessage: "Failed to register device for user with Apple ID: " + developerprofile.AppleID,
				})
			}
		}
	}
	if len(results) == 0 {
		c.JSON(http.StatusCreated, gin.H{"messages": "Devices for user with Apple ID " + developerprofile.AppleID + " registered successfully"})
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results})
	}
}

func registerIPhoneHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	// get semester tag
	var addDeviceRequest developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&addDeviceRequest); err != nil {
		log.Error("Error binding JSON: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	studentLastName := student.LastName
	semesterTag := addDeviceRequest.SemesterTag

	// Extract student details
	iPhoneUDID := developerprofile.IPhoneUDID
	deviceName := semesterTag + "-" + studentLastName + "-" + "iPhone"
	platform := "IOS"

	err = RegisterDevice(c, coursePhaseID, courseParticipationID, deviceName, iPhoneUDID.String, platform)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register iPhone"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "iPhone registered successfully"})
}

func registerIPadHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	// get semester tag
	var addDeviceRequest developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&addDeviceRequest); err != nil {
		log.Error("Error binding JSON: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	studentLastName := student.LastName
	semesterTag := addDeviceRequest.SemesterTag

	// Extract student details
	iPadUDID := developerprofile.IPadUDID
	deviceName := semesterTag + "-" + studentLastName + "-" + "iPad"
	platform := "IOS"

	err = RegisterDevice(c, coursePhaseID, courseParticipationID, deviceName, iPadUDID.String, platform)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register iPad"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "iPad registered successfully"})
}

func registerAppleWatchHandler(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coursePhaseID"})
		return
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID, courseParticipationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	// get semester tag
	var addDeviceRequest developerAccountSetupDTO.AddDeviceRequest
	if err := c.BindJSON(&addDeviceRequest); err != nil {
		log.Error("Error binding JSON: ", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	studentLastName := student.LastName
	semesterTag := addDeviceRequest.SemesterTag

	// Extract student details
	appleWatchUDID := developerprofile.AppleWatchUDID
	deviceName := semesterTag + "-" + studentLastName + "Apple Watch"
	platform := "IOS"

	err = RegisterDevice(c, coursePhaseID, courseParticipationID, deviceName, appleWatchUDID.String, platform)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register Apple Watch"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Apple Watch registered successfully"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
