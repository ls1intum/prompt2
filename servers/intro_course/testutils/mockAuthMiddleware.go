package testutils

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func DefaultMockAuthMiddleware() gin.HandlerFunc {
	return MockAuthMiddlewareWithParticipation(nil, uuid.MustParse("33333333-3333-3333-3333-333333333333"))
}

func MockAuthMiddlewareWithParticipation(mockRoles []string, courseParticipationID uuid.UUID) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRoles := make(map[string]bool)
		for _, role := range mockRoles {
			userRoles[role] = true
		}

		c.Set("userRoles", userRoles)
		c.Set("userEmail", "test@example.com")
		c.Set("matriculationNumber", "0000000")
		c.Set("universityLogin", "testuser")
		c.Set("firstName", "Test")
		c.Set("lastName", "User")
		c.Set("courseParticipationID", courseParticipationID)

		logrus.Info("MockAuthMiddleware: set courseParticipationID ", courseParticipationID)
		c.Next()
	}
}
