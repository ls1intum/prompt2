package keycloakTokenVerifier

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// CombinedMiddleware runs the Keycloak middleware first and, if successful,
// continues with the StudentRoles middleware.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// get CoursePhaseID from path
		coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// use the token to send a request to get the own course phase participation
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithError(http.StatusUnauthorized, fmt.Errorf("missing or invalid Authorization header"))
			return
		}

		// use auth header to send request to get own course phase participation
		authResponse, err := SendAuthRequest(authHeader, coursePhaseID)
		if err != nil {
			c.AbortWithError(http.StatusUnauthorized, fmt.Errorf("failed to get course phase participation"))
			return
		}

		if len(authResponse.Roles) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no roles found"})
			return
		}

		logrus.Info(authResponse)
		c.Set("roles", authResponse.Roles)
		c.Set("courseParticipationID", authResponse.CourseParticipationID)
		c.Set("coursePhaseParticipationID", authResponse.CoursePhaseParticipationID)

		// Continue with the next handler in the chain.
		c.Next()
	}
}
