package applicationAdministration

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/keycloak"
	log "github.com/sirupsen/logrus"
)

func setupApplicationRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, applicationMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	application := router.Group("/applications", authMiddleware())

	// Application Form Endpoints
	application.GET("/:coursePhaseID/form", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getApplicationForm)
	application.PUT("/:coursePhaseID/form", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), updateApplicationForm)
	application.GET("/:coursePhaseID/:coursePhaseParticipationID", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getApplicationByCPPID)
	application.GET("/:coursePhaseID", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getAllApplicationParticipations)

	// Apply Endpoints - No Authentication needed
	apply := router.Group("/apply")
	apply.GET("", getAllOpenApplications)
	apply.GET("/:coursePhaseID", getApplicationFormWithCourseDetails)
	apply.POST("/:coursePhaseID", postApplicationExtern)

	applyAuthenticated := router.Group("/apply/authenticated", applicationMiddleware())
	applyAuthenticated.GET("/:coursePhaseID", getApplicationAuthenticated)
	applyAuthenticated.POST("/:coursePhaseID", postApplicationAuthenticated)

}

func getApplicationForm(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applicationForm, err := GetApplicationForm(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}

	c.IndentedJSON(http.StatusOK, applicationForm)

}

func updateApplicationForm(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updatedApplicationForm applicationDTO.UpdateForm
	if err := c.BindJSON(&updatedApplicationForm); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateUpdateForm(c, coursePhaseId, updatedApplicationForm)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateApplicationForm(c, coursePhaseId, updatedApplicationForm)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not update application form"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "application form updated"})
}

func getAllOpenApplications(c *gin.Context) {
	openApplications, err := GetOpenApplicationPhases(c)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get open applications"))
		return
	}

	c.IndentedJSON(http.StatusOK, openApplications)
}

func getApplicationFormWithCourseDetails(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applicationForm, err := GetApplicationFormWithDetails(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrNotFound) {
			handleError(c, http.StatusNotFound, errors.New("application not found"))
			return
		}
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}

	c.IndentedJSON(http.StatusOK, applicationForm)
}

func getApplicationAuthenticated(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	userEmail := c.GetString("userEmail")

	if userEmail == "" {
		handleError(c, http.StatusUnauthorized, errors.New("no user email found"))
		return
	}

	applicationForm, err := GetApplicationAuthenticatedByEmail(c, userEmail, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}
	c.IndentedJSON(http.StatusOK, applicationForm)

}

func postApplicationExtern(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var application applicationDTO.PostApplication
	if err := c.BindJSON(&application); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateApplication(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = PostApplicationExtern(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrAlreadyApplied) {
			handleError(c, http.StatusMethodNotAllowed, errors.New("already applied"))
			return
		} else if errors.Is(err, ErrStudentDetailsDoNotMatch) {
			handleError(c, http.StatusConflict, errors.New("student exists but details do not match"))
			return
		}

		handleError(c, http.StatusInternalServerError, errors.New("could not post application"))
		return
	}

	// TODO: send mail confirmation to student!
	c.JSON(http.StatusCreated, gin.H{"message": "application posted"})
}

func postApplicationAuthenticated(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	userEmail := c.GetString("userEmail")
	if userEmail == "" {
		handleError(c, http.StatusUnauthorized, errors.New("no user email found"))
		return
	}

	var application applicationDTO.PostApplication
	if err := c.BindJSON(&application); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateApplication(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if application.Student.Email != userEmail {
		handleError(c, http.StatusUnauthorized, errors.New("email does not match - is not allowed to be changed"))
		return
	}

	err = PostApplicationAuthenticatedStudent(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not post application"))
		return
	}

	// TODO: send mail confirmation to student!
	c.JSON(http.StatusCreated, gin.H{"message": "application posted"})
}

func getApplicationByCPPID(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	coursePhaseParticipationId, err := uuid.Parse(c.Param("coursePhaseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	application, err := GetApplicationByCPPID(c, coursePhaseId, coursePhaseParticipationId)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrNotFound) {
			handleError(c, http.StatusNotFound, errors.New("application not found"))
			return
		}
		handleError(c, http.StatusInternalServerError, errors.New("could not get application"))
		return
	}

	c.IndentedJSON(http.StatusOK, application)
}

func getAllApplicationParticipations(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applications, err := GetAllApplicationParticipations(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get applications"))
		return
	}

	c.IndentedJSON(http.StatusOK, applications)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
