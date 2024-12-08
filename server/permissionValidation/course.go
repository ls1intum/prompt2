package permissionValidation

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CheckCoursePermission(c *gin.Context, courseID uuid.UUID, allowedUsers []string, adminRight ...string) (bool, error) {
	courseIdentifier, err := courseIdentifierStringFromCourseID(c, courseID)
	if err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return false, err
	}

	return checkUserRole(c, courseIdentifier, allowedUsers, adminRight...)
}

func courseIdentifierStringFromCourseID(ctx context.Context, uuid uuid.UUID) (string, error) {
	identifier, err := ValidationServiceSingleton.queries.GetPermissionStringByCourseID(ctx, uuid)
	if err != nil {
		return "", err
	}
	value, ok := identifier.(string)
	if !ok {
		return "", fmt.Errorf("expected string but got %T", identifier)
	}
	return value, nil

}
