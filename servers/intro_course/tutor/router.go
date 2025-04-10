package tutor

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/coreRequests"
	"github.com/ls1intum/prompt2/servers/intro_course/tutor/tutorDTO"
	log "github.com/sirupsen/logrus"
)

func setupTutorRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	tutorRouter := router.Group("/tutor")
	tutorRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getTutors)
	// we need the courseID to add students to keycloak groups
	tutorRouter.POST("/course/:courseID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), importTutors)
	tutorRouter.PUT("/:tutorID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateGitLabUsername)
}

func getTutors(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	tutors, err := GetTutors(c, coursePhaseID)
	if err != nil {
		log.Error("Error getting tutors: ", err)
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, tutors)
}

func importTutors(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		log.Error("Error parsing courseID: ", err)
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
	err = coreRequests.SendAddStudentsToKeycloakGroup(c.GetHeader("Authorization"), courseID, tutorIDs, KEYCLOAK_GROUP_NAME)
	if err != nil {
		log.Error("Error adding tutors to custom keycloak group: ", err)
		handleError(c, http.StatusInternalServerError, errors.New("error adding tutors to custom keycloak group"))
		return
	}
	err = coreRequests.SendAddStudentsToKeycloakGroup(c.GetHeader("Authorization"), courseID, tutorIDs, "editor")
	if err != nil {
		log.Error("Error adding tutors to editor keycloak group: ", err)
		handleError(c, http.StatusInternalServerError, errors.New("error adding tutors to editor keycloak group"))
		return
	}

	if err := ImportTutors(c, coursePhaseID, tutors); err != nil {
		log.Error("Error importing tutors: ", err)
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func updateGitLabUsername(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	tutorID, err := uuid.Parse(c.Param("tutorID"))
	if err != nil {
		log.Error("Error parsing tutorID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var tutor tutorDTO.UpdateTutor
	if err := c.BindJSON(&tutor); err != nil {
		log.Error("Error binding tutor: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := UpdateGitLabUsername(c, coursePhaseID, tutorID, tutor); err != nil {
		log.Error("Error updating gitlab username: ", err)
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
