package developerProfile

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile/developerProfileDTO"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
	log "github.com/sirupsen/logrus"
)

func setupDeveloperProfileRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	developerProfile := router.Group("/developer_profile")
	developerProfile.POST("", authMiddleware(keycloakTokenVerifier.CourseStudent), createDeveloperProfile)
	developerProfile.GET("/self", authMiddleware(keycloakTokenVerifier.CourseStudent), getOwnDeveloperProfile)
	// Getting all developer profiles is only allowed for lecturers
	developerProfile.GET("", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), getAllDeveloperProfiles)
	developerProfile.PUT("/:courseParticipationID", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), updateDeveloperProfile)

}

func createDeveloperProfile(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// ger course participation id from context
	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	var request developerProfileDTO.PostDeveloperProfile
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = CreateDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID), request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func getOwnDeveloperProfile(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		log.Error("Error getting courseParticipationID from context")
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	developerProfile, err := GetOwnDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID))
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, developerProfile)
}

func getAllDeveloperProfiles(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	developerProfiles, err := GetAllDeveloperProfiles(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, developerProfiles)
}

func updateDeveloperProfile(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var devProfile developerProfileDTO.DeveloperProfile
	if err := c.BindJSON(&devProfile); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = CreateOrUpdateDeveloperProfile(c, coursePhaseID, courseParticipationID, devProfile)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
