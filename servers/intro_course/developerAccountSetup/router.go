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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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

	for _, device := range devices {
		deviceName := device.Name
		deviceUDID := device.UDID.String
		platform := "IOS"
		err = RegisterDevice(deviceName, deviceUDID, platform)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register device" + deviceName})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Device " + deviceName + " registered successfully"})
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Devices registered successfully"})
}
