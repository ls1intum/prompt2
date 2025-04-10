package tease

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
)

func setupTeaseRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	teaseRouter := routerGroup.Group("/tease")

	// we need the keycloak middleware here to ensure that the user has a valid token
	teaseRouter.GET("/course-phases", keycloakTokenVerifier.KeycloakMiddleware(), getAllCoursePhases)

	// course phase specific endpoints
	// teaseCoursePhaseRouter := teaseRouter.Group("/course_phase/:coursePhaseID")
}

func getAllCoursePhases(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}

	userRoles := rolesVal.(map[string]bool)
	teasePhases, err := GetTeamAllocationCoursePhases(
		c.Request.Context(),
		authHeader,
		userRoles,
	)

	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, teasePhases)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
