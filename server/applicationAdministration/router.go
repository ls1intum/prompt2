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

// TBD: I will postpone this till I write the client side.
// currently it is too much guess work which endpoints I will need.
func setupApplicationRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	application := router.Group("/applications", authMiddleware())

	// Application Form Endpoints
	application.GET("/:coursePhaseID/form", permissionIDMiddleware(keycloak.CourseLecturer, keycloak.CourseEditor), getApplicationForm)
	application.PUT("/:coursePhaseID/form", permissionIDMiddleware(keycloak.CourseLecturer), updateApplicationForm)

	// Application Endpoints
	// application.GET("/:coursePhaseID/applications", permissionIDMiddleware("CourseLecturer", "CourseEditor"), getApplications)

}

func getApplicationForm(c *gin.Context) {
	// TODO
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

	// TODO Validation of application form
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

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}