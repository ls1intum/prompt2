package permissionValidation

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func CheckCoursePhasePermission(c *gin.Context, coursePhaseID uuid.UUID, allowedUsers ...string) (bool, error) {
	courseIdentifier, err := courseIdentifierStringFromCoursePhaseID(c, coursePhaseID)
	if err != nil {
		c.IndentedJSON(500, gin.H{"error": err.Error()})
		return false, err
	}

	return checkUserRole(c, courseIdentifier, allowedUsers...)
}

func courseIdentifierStringFromCoursePhaseID(ctx context.Context, uuid uuid.UUID) (string, error) {
	identifier, err := ValidationServiceSingleton.queries.GetPermissionStringByCoursePhaseID(ctx, uuid)
	if err != nil {
		return "", err
	}
	value, ok := identifier.(string)
	if !ok {
		return "", fmt.Errorf("expected string but got %T", identifier)
	}
	return value, nil

}
