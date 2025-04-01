package developerAccountSetup

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
)

func setupDeveloperAccountSetupRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	accountSetup := router.Group("/developer_account")
	accountSetup.POST("/invite", authMiddleware("admin"), inviteUserHandler)
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

	// Extract student details
	email := student.Email
	firstName := student.FirstName
	lastName := student.LastName

	// Invite the user
	err = InviteUser(email, firstName, lastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User invited successfully"})
}
