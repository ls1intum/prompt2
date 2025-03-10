package developerProfile

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile/developerProfileDTO"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
	"github.com/sirupsen/logrus"
)

func setupDeveloperProfileRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	developerProfile := router.Group("/developer_profile")
	developerProfile.POST("", authMiddleware(keycloakTokenVerifier.CourseStudent), createDeveloperProfile)
}

func createDeveloperProfile(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		logrus.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// ger course participation id from context
	courseParticipationID, ok := c.Get("courseParticipationID")
	if !ok {
		logrus.Error("Error getting courseParticipationID from context")
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	var request developerProfileDTO.PostDeveloperProfile
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	logrus.Info("Creating developer profile")
	err = CreateDeveloperProfile(c, coursePhaseID, courseParticipationID.(uuid.UUID), request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
