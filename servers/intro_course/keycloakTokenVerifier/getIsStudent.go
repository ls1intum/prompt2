package keycloakTokenVerifier

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier/coreRequests"
	log "github.com/sirupsen/logrus"
)

// Important: This requires a CoursePhaseID as a parameter.
func IsStudentOfCoursePhaseMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
		if err != nil {
			log.Error("Error parsing coursePhaseID:", err)
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		if coursePhaseID == uuid.Nil {
			log.Error("Invalid coursePhaseID")
			c.AbortWithError(http.StatusBadRequest, errors.New("coursePhaseID missing"))
			return
		}

		// TODO: Wrap this around a caching component
		// request from the core if the user is a student of the course phase
		isStudentResponse, err := coreRequests.SendIsStudentRequest(c.GetHeader("Authorization"), coursePhaseID)
		if err != nil {
			if err.Error() == "not student of course" {
				c.Set("isStudentOfCourse", false)
				c.Set("isStudentOfCoursePhase", false)
			} else {
				log.Error("Error getting course roles:", err)
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		} else {
			c.Set("isStudentOfCourse", true)
			c.Set("isStudentOfCoursePhase", isStudentResponse.IsStudentOfCoursePhase)
			c.Set("courseParticipationID", isStudentResponse.CourseParticipationID)
		}

		c.Next()
	}
}
