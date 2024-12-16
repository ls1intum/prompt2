package course

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
)

func setupCourseRouter(router *gin.RouterGroup) {
	course := router.Group("/courses")
	course.GET("/", getAllCourses)
	course.GET("/:uuid", getCourseByID)
	course.POST("/", createCourse)
	course.PUT("/:uuid/phase_graph", updateCoursePhaseOrder)
	course.GET("/:uuid/phase_graph", getCoursePhaseGraph)
	// TODO: course.PUT("/", updateCourse)
}

func getAllCourses(c *gin.Context) {
	courses, err := GetAllCourses(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courses)
}

func getCourseByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	course, err := GetCourseByID(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, course)
}

func createCourse(c *gin.Context) {
	var newCourse courseDTO.CreateCourse
	if err := c.BindJSON(&newCourse); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateCreateCourse(newCourse); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	course, err := CreateCourse(c, newCourse)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusCreated, course)
}

func getCoursePhaseGraph(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	graph, err := GetCoursePhaseGraph(c, courseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, graph)
}

func updateCoursePhaseOrder(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updatedPhaseOrder courseDTO.CoursePhaseOrderRequest
	if err := c.BindJSON(&updatedPhaseOrder); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateUpdateCourseOrder(c, courseID, updatedPhaseOrder); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateCoursePhaseOrder(c, courseID, updatedPhaseOrder)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
