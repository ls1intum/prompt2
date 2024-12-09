package permissionValidation

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/niclasheun/prompt2.0/keycloak"
)

func checkUserRole(c *gin.Context, courseIdentifier string, allowedUsers []string) (bool, error) {
	// Extract user roles from context
	rolesVal, exists := c.Get("userRoles")
	if !exists {
		err := errors.New("user roles not found in context")
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return false, err
	}

	userRoles, ok := rolesVal.(map[string]bool)
	if !ok {
		err := errors.New("invalid roles format in context")
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return false, err
	}

	// Generate the desired role keys based on input
	for _, role := range allowedUsers {
		var desiredRole string = ""
		if role == keycloak.PromptAdmin || role == keycloak.PromptLecturer {
			desiredRole = role
		} else {
			desiredRole = fmt.Sprintf("%s-%s", courseIdentifier, role)
		}
		if userRoles[desiredRole] {
			return true, nil // Found at least one matching role
		}
	}

	c.IndentedJSON(403, gin.H{"error": "no matching permission found"})

	return false, nil // No matching role found
}
