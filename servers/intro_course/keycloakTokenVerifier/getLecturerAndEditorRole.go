package keycloakTokenVerifier

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier/keycloakCoreRequests"
	log "github.com/sirupsen/logrus"
)

// Important: This requires a CoursePhaseID as a parameter.
func GetLecturerAndEditorRole() gin.HandlerFunc {
	return func(c *gin.Context) {
		coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
		if err != nil {
			log.Error("Error parsing coursePhaseID:", err)
			_ = c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		if coursePhaseID == uuid.Nil {
			log.Error("Invalid coursePhaseID")
			_ = c.AbortWithError(http.StatusBadRequest, errors.New("coursePhaseID missing"))
			return
		}

		// TODO: Wrap this around a caching component
		// retrieve the relevant roles from the core
		tokenMapping, err := keycloakCoreRequests.SendCoursePhaseRoleMappingRequest(c.GetHeader("Authorization"), coursePhaseID)
		if err != nil {
			log.Error("Error getting course roles:", err)
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		// get roles from the context
		rolesVal, exists := c.Get("userRoles")
		if !exists {
			err := errors.New("user roles not found in context")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		userRoles, ok := rolesVal.(map[string]bool)
		if !ok {
			err := errors.New("invalid roles format in context")
			c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// filter out the roles relevant for the current course phase
		isLecturer := userRoles[tokenMapping.CourseLecturerRole]
		isTutor := userRoles[tokenMapping.CourseEditorRole]

		c.Set("isLecturer", isLecturer)
		c.Set("isTutor", isTutor)
		c.Set("customRolePrefix", tokenMapping.CustomRolePrefix)
	}
}
