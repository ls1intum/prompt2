package keycloakRealmManager

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/keycloakRealmManager/keycloakRealmDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func setupKeycloakRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	keycloak := router.Group("/keycloak/:courseID", authMiddleware())
	keycloak.PUT("/group", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), createCustomGroup)
	keycloak.GET("/group/:groupName/students", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), getStudentsInGroup)
	// Adding Students to the editor role of a course
	keycloak.PUT("/group/editor/students", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), addStudentsToEditorGroup)
	// Adding Students to a custom group
	keycloak.PUT("/group/:groupName/students", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), addStudentsToGroup)
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

func addStudentsToEditorGroup(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request keycloakRealmDTO.AddStudentsToGroup
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	addingReport, err := AddStudentsToEditorGroup(c, courseID, request.StudentsToAdd)
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
