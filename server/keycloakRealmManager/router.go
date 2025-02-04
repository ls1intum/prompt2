package keycloakRealmManager

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/keycloakRealmManager/keycloakRealmDTO"
)

func setupKeycloakRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	keycloak := router.Group("/keycloak/:courseID")
	keycloak.PUT("", createCustomGroup)
	keycloak.GET("/group/:groupName/students", getStudentsInGroup)
	keycloak.PUT("/group/:groupName/students", addStudentsToGroup)
}

func createCustomGroup(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newGroupName keycloakRealmDTO.CreateGroup
	if err := c.BindJSON(&newGroupName); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	id, err := AddCustomGroup(c, courseID, newGroupName.GroupName)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"id": id})
}

func addStudentsToGroup(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	groupName := c.Param("groupName")
	if groupName == "" {
		handleError(c, http.StatusBadRequest, errors.New("group name is required"))
		return
	}

	var request keycloakRealmDTO.AddStudentsToGroup
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	addingReport, err := AddStudentsToGroup(c, courseID, request.StudentsToAdd, groupName)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, addingReport)
}

func getStudentsInGroup(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	groupName := c.Param("groupName")
	if groupName == "" {
		handleError(c, http.StatusBadRequest, errors.New("group name is required"))
		return
	}

	students, err := GetStudentsInGroup(c, courseID, groupName)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, students)

}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
