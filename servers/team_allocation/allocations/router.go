package allocations

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
)

func setupAllocationsRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	allocationsRouter := routerGroup.Group("/allocations")

	// we need the keycloak middleware here to ensure that the user has a valid token
	allocationsRouter.GET("/course-phases", keycloakTokenVerifier.KeycloakMiddleware(), getAllCoursePhases)
}

func getAllCoursePhases(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}

	userRoles, ok := rolesVal.(map[string]bool)
	if !ok {
		handleError(c, http.StatusInternalServerError, errors.New("invalid user roles format"))
		return
	}

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
