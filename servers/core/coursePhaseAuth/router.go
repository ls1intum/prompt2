package coursePhaseAuth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func setupCoursePhaseAuthRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc) {
	coursePhaseAuth := router.Group("/auth/course_phase/:coursePhaseID", authMiddleware())
	coursePhaseAuth.GET("/", getCoursePhaseAuthRoles)
}

func getCoursePhaseAuthRoles(c *gin.Context) {
	// Get the course phase ID from the URL
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.IndentedJSON(400, gin.H{"error": "invalid course phase ID"})
		return
	}

	// Extract user roles from context
	rolesVal, exists := c.Get("userRoles")
	if !exists {
		err := errors.New("user roles not found in context")
		c.IndentedJSON(401, gin.H{"error": err.Error()})
		return
	}

	userRoles, ok := rolesVal.(map[string]bool)
	if !ok {
		err := errors.New("invalid roles format in context")
		c.IndentedJSON(401, gin.H{"error": err.Error()})
		return
	}

	matriculationNumber := c.GetString("matriculationNumber")
	universityLogin := c.GetString("universityLogin")

	// use coursePhaseID and userRoles to check for permissions
	authResponse, err := getUserAuth(c, coursePhaseID, userRoles, matriculationNumber, universityLogin)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, authResponse)
}
