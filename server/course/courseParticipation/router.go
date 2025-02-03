package courseParticipation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseParticipation/courseParticipationDTO"
	"github.com/niclasheun/prompt2.0/keycloakRealmManager"
)

func setupCourseParticipationRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	// incoming path should be /course/:uuid/
	courseParticipation := router.Group("/courses/:uuid/participations", authMiddleware())
	courseParticipation.GET("", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer, keycloakRealmManager.CourseEditor), getCourseParticipationsForCourse)
	courseParticipation.POST("/enroll", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer), createCourseParticipation)
}

// TODO: in future think about how to integrate / create "passed" students from previous phases
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
