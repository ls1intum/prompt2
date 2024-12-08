package testutils

import "github.com/gin-gonic/gin"

func MockMiddleware(mockRoles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Optionally set mock data, such as roles, for downstream handlers
		// Create a map for user roles
		userRoles := make(map[string]bool)
		for _, role := range mockRoles {
			userRoles[role] = true
		}
		// Store the roles map in the context
		c.Set("userRoles", userRoles)
		c.Next()
	}
}
