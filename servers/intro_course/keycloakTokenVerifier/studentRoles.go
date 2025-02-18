package keycloakTokenVerifier

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func StudentRolesMiddleware() gin.HandlerFunc {
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
		coursePhaseParticipation, err := SendStudentAuthRequest(authHeader, coursePhaseID)
		if err != nil {
			c.AbortWithError(http.StatusUnauthorized, fmt.Errorf("failed to get course phase participation"))
			return
		}
		logrus.Info(coursePhaseParticipation)
		c.Set("courseParticipationID", coursePhaseParticipation.CourseParticipationID)
		c.Set("coursePhaseParticipationID", coursePhaseParticipation.ID)

		c.Next()
	}
}
