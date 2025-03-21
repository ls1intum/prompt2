package testutils

import (
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func MockAuthMiddlewareWithEmail(mockRoles []string, email, matriculationNumber, universityLogin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Optionally set mock data, such as roles, for downstream handlers
		// Create a map for user roles
		userRoles := make(map[string]bool)
		for _, role := range mockRoles {
			userRoles[role] = true
		}
		// Store the roles map in the context
		c.Set("userRoles", userRoles)
		c.Set("userEmail", email)
		c.Set("matriculationNumber", matriculationNumber)
		c.Set("universityLogin", universityLogin)
		c.Set("firstName", "John")
		c.Set("lastName", "Doe")
		logrus.Info("MockAuthMiddleware: Mocked user mail: ", email)
		c.Next()
	}
}

func MockAuthMiddleware(mockRoles []string) gin.HandlerFunc {
	return MockAuthMiddlewareWithEmail(mockRoles, "", "", "")
}
