package developerAccountSetup

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile"
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

	// Fetch student details
	student, err := coreRequests.SendGetStudent(authHeader, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student details"})
		return
	}

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing courseParticipationID"})
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	// Extract student details
	appleID := developerprofile.AppleID
	firstName := student.FirstName
	lastName := student.LastName

	// Invite the user
	err = InviteUser(appleID, firstName, lastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite user"})
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

	// Fetch all students from the course phase
	participations, err := coreRequests.SendGetCoursePhaseParticipations(authHeader, coursePhaseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get course phase participations"})
		return
	}

	for _, participation := range participations {
		courseParticipationID := participation.CourseParticipationID
		coursePhaseID := participation.CoursePhaseID
		student := participation.Student

		developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID)
		if err != nil {
			log.Error("Error getting developer profile: ", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
			return
		}

		appleID := developerprofile.AppleID
		firstName := student.FirstName
		lastName := student.LastName

		// Invite the user
		err = InviteUser(appleID, firstName, lastName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite user"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "User " + appleID + " invited successfully"})

	}

	c.JSON(http.StatusCreated, gin.H{"message": "Users invited successfully"})

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

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing courseParticipationID"})
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	// Extract student details
	appleWatchUDID := developerprofile.AppleWatchUDID
	iPhoneUDID := developerprofile.IPhoneUDID
	iPadUDID := developerprofile.IPadUDID

	devices := []struct {
		Name string
		UDID pgtype.Text
	}{
		{Name: "Apple Watch", UDID: appleWatchUDID},
		{Name: "iPhone", UDID: iPhoneUDID},
		{Name: "iPad", UDID: iPadUDID},
	}

	var results []struct {
		deviceName   string
		errorMessage string
	}
	for _, device := range devices {
		deviceName := device.Name
		deviceUDID := device.UDID.String
		platform := "IOS"
		err = RegisterDevice(deviceName, deviceUDID, platform)
		if err != nil {
			results = append(results, struct {
				deviceName   string
				errorMessage string
			}{
				deviceName:   deviceName,
				errorMessage: "Failed to register device for user with Apple ID: " + developerprofile.AppleID,
			})
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

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing courseParticipationID"})
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	// Extract student details
	iPhoneUDID := developerprofile.IPhoneUDID
	deviceName := "iPhone"
	platform := "IOS"

	err = RegisterDevice(deviceName, iPhoneUDID.String, platform)
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

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing courseParticipationID"})
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	// Extract student details
	iPadUDID := developerprofile.IPadUDID
	deviceName := "iPad"
	platform := "IOS"

	err = RegisterDevice(deviceName, iPadUDID.String, platform)
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

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing courseParticipationID"})
		return
	}

	developerprofile, err := developerProfile.GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		log.Error("Error getting developer profile: ", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get developer profile"})
		return
	}

	// Extract student details
	appleWatchUDID := developerprofile.AppleWatchUDID
	deviceName := "Apple Watch"
	platform := "IOS"

	err = RegisterDevice(deviceName, appleWatchUDID.String, platform)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register Apple Watch"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Apple Watch registered successfully"})
}
