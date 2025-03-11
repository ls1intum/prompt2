package tutors

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/intro_course/tutor/tutorDTO"
	"github.com/opentracing/opentracing-go/log"
)

func setupTutorRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	tutorRouter := router.Group("/tutor")

	tutorRouter.POST("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), importTutors)
}

func importTutors(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var tutors []tutorDTO.Tutor
	if err := c.BindJSON(&tutors); err != nil {
		log.Error("Error binding tutors: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// Add Tutors to keycloak group
	tutorIDs := make([]uuid.UUID, len(tutors))
	for i, tutor := range tutors {
		tutorIDs[i] = tutor.ID
	}
	coreRequests.SendAddStudentsToKeycloakGroup(c.GetHeader("Authorization"), courseID, tutorIDs, KEYCLOAK_GROUP_NAME)

	if err := ImportTutors(c, coursePhaseID, tutors); err != nil {
		log.Error("Error importing tutors: ", err)
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
