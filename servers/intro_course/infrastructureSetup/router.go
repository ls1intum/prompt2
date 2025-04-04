package infrastructureSetup

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/intro_course/infrastructureSetup/infrastructureDTO"
	log "github.com/sirupsen/logrus"
)

func setupInfrastructureRouter(router *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	infrastructureRouter := router.Group("/infrastructure")

	// Infrastructure setup routes
	infrastructureRouter.POST("/gitlab/course-setup", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createCourseSetup)
	infrastructureRouter.POST("/gitlab/student-setup/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), setupStudentInfrastructure)

	// Infrastructure status routes
	infrastructureRouter.GET("/gitlab/student-setup", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getAllStudentGitlabStatus)

	// Route for manually overwriting the status (i.e. if instructor manually created or fixed the repo)
	infrastructureRouter.PUT("/gitlab/student-setup/:courseParticipationID/manual", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), manuallyOverwriteStudentGitlabStatus)
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

	err = CreateCourseInfrastructure(coursePhaseID, infrastructureRequest.SemesterTag)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)
}

func setupStudentInfrastructure(c *gin.Context) {
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

	// get semester tag (= top level group name)
	var infrastructureRequest infrastructureDTO.CreateStudentRepo
	if err := c.BindJSON(&infrastructureRequest); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = CreateStudentInfrastructure(c, coursePhaseID, courseParticipationID, infrastructureRequest.SemesterTag, infrastructureRequest.RepoName, infrastructureRequest.SubmissionDeadline)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusCreated)

}

func getAllStudentGitlabStatus(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	studentInfrastructureStatus, err := GetAllStudentGitlabStatus(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, studentInfrastructureStatus)
}

func manuallyOverwriteStudentGitlabStatus(c *gin.Context) {
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

	err = ManuallyOverwriteStudentGitlabStatus(c, coursePhaseID, courseParticipationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully overwritten student gitlab status"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
