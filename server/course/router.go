package course

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/permissionValidation"
)

func setupCourseRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc) {
	course := router.Group("/courses", authMiddleware())
	course.GET("/", authMiddleware(), getAllCourses)
	course.GET("/:uuid", authMiddleware(), getCourseByID)
	course.POST("/", authMiddleware(), createCourse)
	course.PUT("/:uuid/phase_graph", updateCoursePhaseOrder)
	// TODO: course.PUT("/", updateCourse)
}

func getAllCourses(c *gin.Context) {
	courses, err := GetAllCourses(c)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}
	userRoles := rolesVal.(map[string]bool)

	if userRoles["courses:view-all"] {
		c.IndentedJSON(http.StatusOK, courses)
		return
	}

	// Filtern Sie die Kurse basierend auf den Berechtigungen
	filteredCourses := []courseDTO.CourseWithPhases{}
	allowedUsers := []string{"Lecturer", "Editor", "Student"}
	for _, course := range courses {
		for _, role := range allowedUsers {
			desiredRole := fmt.Sprintf("%s-%s-%s", course.Name, course.SemesterTag, role)
			if userRoles[desiredRole] {
				filteredCourses = append(filteredCourses, course)
				break
			}
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

	hasAccess, err := permissionValidation.CheckCoursePermission(c, id, []string{"Lecturer", "Editor", "Student"}, "courses:view-all")
	if err != nil || !hasAccess {
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
	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}
	userRoles := rolesVal.(map[string]bool)

	if !userRoles["courses:create"] {
		handleError(c, http.StatusForbidden, errors.New("missing permission to create course"))
		return
	}

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

	hasAccess, err := permissionValidation.CheckCoursePermission(c, courseID, []string{"Lecturer"}, "courses:modify-all")
	if err != nil || !hasAccess {
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
