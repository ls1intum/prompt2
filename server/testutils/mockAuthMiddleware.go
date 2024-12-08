package testutils

import "github.com/gin-gonic/gin"

func MockMiddleware(requiredRoles []string, mockRoles []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Optionally set mock data, such as roles, for downstream handlers
		roles := make([]interface{}, len(mockRoles))
		for i, role := range mockRoles {
			roles[i] = role
		}
		c.Set("roles", roles)
		c.Next()
	}
}
