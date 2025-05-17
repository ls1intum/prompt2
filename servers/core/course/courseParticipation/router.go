package courseParticipation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/course/courseParticipation/courseParticipationDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
)

func setupCourseParticipationRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	// incoming path should be /course/:uuid/
	courseParticipation := router.Group("/courses/:uuid/participations", authMiddleware())
	courseParticipation.GET("", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getCourseParticipationsForCourse)
	courseParticipation.POST("/enroll", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), createCourseParticipation)
	courseParticipation.GET("/self", getOwnCourseParticipation)
}

func getOwnCourseParticipation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	matriculationNumber := c.GetString("matriculationNumber")
	universityLogin := c.GetString("universityLogin")

	if matriculationNumber == "" || universityLogin == "" {
		// potentially users without studentIDs are using the system -> no error shall be thrown
		c.JSON(http.StatusOK, courseParticipationDTO.GetOwnCourseParticipation{
			ID:                 uuid.Nil,
			ActiveCoursePhases: []uuid.UUID{},
		})
		return
	}

	courseParticipation, err := GetOwnCourseParticipation(c, id, matriculationNumber, universityLogin)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
}

func getCourseParticipationsForCourse(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipations, err := GetAllCourseParticipationsForCourse(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipations)
}

func createCourseParticipation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newCourseParticipation courseParticipationDTO.CreateCourseParticipation
	if err := c.BindJSON(&newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// get course id from path
	newCourseParticipation.CourseID = id

	if err := Validate(newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := CreateCourseParticipation(c, nil, newCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
