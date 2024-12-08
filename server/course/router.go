package course

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
)

func setupCourseRouter(router *gin.RouterGroup, authMiddleware func([]string) gin.HandlerFunc) {
	course := router.Group("/courses")
	course.GET("/", authMiddleware([]string{}), getAllCourses)
	course.GET("/:uuid", authMiddleware([]string{}), getCourseByID)
	course.POST("/", authMiddleware([]string{"courses:create"}), createCourse)
	course.PUT("/:uuid/phase_graph", updateCoursePhaseOrder)
	// TODO: course.PUT("/", updateCourse)
}

func getAllCourses(c *gin.Context) {
	courses, err := GetAllCourses(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	permissions, exists := c.Get("roles")
	if !exists {
		handleError(c, http.StatusForbidden, err)
		return
	}

	userRoles := make(map[string]bool)
	for _, role := range permissions.([]interface{}) {
		if roleStr, ok := role.(string); ok {
			userRoles[roleStr] = true
		}
	}

	if userRoles["courses:view-all"] {
		c.IndentedJSON(http.StatusOK, courses)
		return
	}

	// Filtern Sie die Kurse basierend auf den Berechtigungen
	filteredCourses := []courseDTO.CourseWithPhases{}
	for _, course := range courses {
		permissionString := course.Name + "-" + course.SemesterTag + ":view"
		if userRoles[permissionString] {
			filteredCourses = append(filteredCourses, course)
		}
	}

	c.IndentedJSON(http.StatusOK, filteredCourses)
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
