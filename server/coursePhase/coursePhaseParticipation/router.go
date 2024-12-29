package coursePhaseParticipation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
)

func setupCoursePhaseParticipationRouter(routerGroup *gin.RouterGroup) {
	courseParticipation := routerGroup.Group("/course_phases/:uuid/participations")
	courseParticipation.GET("", getParticipationsForCoursePhase)
	courseParticipation.POST("", createCoursePhaseParticipation)
	courseParticipation.GET("/:participation_uuid", getParticipation)
	courseParticipation.PUT("/:participation_uuid", updateCoursePhaseParticipation)
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

func getParticipation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("participation_uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := GetCoursePhaseParticipation(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
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

	updatedCourseParticipation.ID = id

	err = UpdateCoursePhaseParticipation(c, updatedCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated course phase participation"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
