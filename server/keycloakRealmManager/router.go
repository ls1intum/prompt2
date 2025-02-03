package keycloakRealmManager

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func setupKeycloakRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	keycloak := router.Group("/keycloak/:courseID")
	keycloak.PUT("", createCustomGroup)
}

func createCustomGroup(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	id, err := AddCustomGroup(c, courseID, "test")
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"id": id})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
