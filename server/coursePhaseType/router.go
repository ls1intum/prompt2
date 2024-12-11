package coursePhaseType

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupCoursePhaseTypeRouter(router *gin.RouterGroup) {
	course := router.Group("/course_phase_types")
	course.GET("", getAllCoursePhaseTypes)
}

func getAllCoursePhaseTypes(c *gin.Context) {
	coursePhaseTypes, err := GetAllCoursePhaseTypes(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, coursePhaseTypes)
}
