package infrastructureSetup

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/intro_course/infrastructureSetup/infrastructureDTO"
	log "github.com/sirupsen/logrus"
)

func setupInfrastructureRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	infrastructureRouter := router.Group("/infrastructure")

	// Post initial seat plan with seat names
	infrastructureRouter.POST("/course-setup", createCourseSetup)

	// infrastructureRouter.POST("/gitlab/student/:studentID", authMiddleware(keycloakTokenVerifier.PromptAdmin, keycloakTokenVerifier.CourseLecturer), createGithubRepository)
}

func createCourseSetup(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// get semester tag (= top level group name)
	var infrastructureRequest infrastructureDTO.CreateCourseInfrastructureRequest
	if err := c.BindJSON(&infrastructureRequest); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = CreateCourseInfrastructure(c, coursePhaseID, infrastructureRequest.SemesterTag)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
