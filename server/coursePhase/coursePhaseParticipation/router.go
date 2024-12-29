package coursePhaseParticipation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/sirupsen/logrus"
)

func setupCoursePhaseParticipationRouter(routerGroup *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	courseParticipation := routerGroup.Group("/course_phases/:uuid/participations", authMiddleware())
	courseParticipation.GET("", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getParticipationsForCoursePhase)
	courseParticipation.POST("", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), createCoursePhaseParticipation)
	courseParticipation.PUT("/:participation_uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), updateCoursePhaseParticipation)
}

func getParticipationsForCoursePhase(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipations, err := GetAllParticipationsForCoursePhase(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipations)
}

func createCoursePhaseParticipation(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newCourseParticipation coursePhaseParticipationDTO.CreateCoursePhaseParticipation
	if err := c.BindJSON(&newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	newCourseParticipation.CoursePhaseID = coursePhaseID

	if err := Validate(newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := CreateCoursePhaseParticipation(c, newCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusCreated, courseParticipation)
}

func updateCoursePhaseParticipation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("participation_uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updatedCourseParticipation coursePhaseParticipationDTO.UpdateCoursePhaseParticipation
	if err := c.BindJSON(&updatedCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	logrus.Error(id)

	updatedCourseParticipation.ID = id

	courseParticipation, err := UpdateCoursePhaseParticipation(c, updatedCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusOK, courseParticipation)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
