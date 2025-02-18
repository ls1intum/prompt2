package keycloakTokenVerifier

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CombinedMiddleware runs the Keycloak middleware first and, if successful,
// continues with the StudentRoles middleware.
func AuthMiddleware() gin.HandlerFunc {
	// Capture the individual middleware handlers.
	keycloakMW := KeycloakMiddleware()
	studentRolesMW := StudentRolesMiddleware()

	return func(c *gin.Context) {
		// Execute Keycloak middleware.
		keycloakMW(c)
		// If the Keycloak middleware aborted the request, do not continue.
		if c.IsAborted() {
			return
		}

		// Execute StudentRoles middleware.
		studentRolesMW(c)
		// If the StudentRoles middleware aborted the request, do not continue.
		if c.IsAborted() {
			return
		}

		// get courseParticipation form the student Role
		// get CoursePhaseID from path
		coursePhaseParticipationID, err := uuid.Parse(c.GetString("coursePhaseParticipationID"))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		// Continue with the next handler in the chain.
		c.Next()
	}
}
