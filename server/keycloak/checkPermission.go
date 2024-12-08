package keycloak

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
)

func CheckUserRole(c *gin.Context, courseName, semesterTag string, allowedUsers []string, adminRight ...string) (bool, error) {
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

	// check if the user has the required 'all' right (i.e. view-all, create-all)
	if len(adminRight) > 0 && userRoles[adminRight[0]] {
		return true, nil
	}

	// Generate the desired role keys based on input
	for _, role := range allowedUsers {
		desiredRole := fmt.Sprintf("%s-%s-%s", courseName, semesterTag, role)
		if userRoles[desiredRole] {
			return true, nil // Found at least one matching role
		}
	}

	c.IndentedJSON(403, gin.H{"error": "no matching permission found"})

	return false, nil // No matching role found
}

// TODO add a db connection to keycloak and move the whole verificaiton into this package!!!
