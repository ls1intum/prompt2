package course

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/keycloak"
	log "github.com/sirupsen/logrus"
)

// Id Middleware for all routes with a course id
// Role middleware for all without id -> possible additional filtering in subroutes required
func setupCourseRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	course := router.Group("/courses", authMiddleware())
	course.GET("/", permissionRoleMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor, keycloak.CourseStudent), getAllCourses)
	course.GET("/:uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getCourseByID)
	course.POST("/", permissionRoleMiddleware(keycloak.PromptAdmin, keycloak.PromptLecturer), createCourse)
	course.PUT("/:uuid/phase_graph", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), updateCoursePhaseOrder)
	course.GET("/:uuid/phase_graph", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getCoursePhaseGraph)
	course.GET("/:uuid/meta_graph", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getMetaDataGraph)
	course.PUT("/:uuid/meta_graph", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), updateMetaDataGraph)
	course.PUT("/:uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), updateCourseData)
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
	if userRoles[keycloak.PromptAdmin] {
		c.IndentedJSON(http.StatusOK, courses)
		return
	}

	// TODO: move this to DB request
	// Filtern Sie die Kurse basierend auf den Berechtigungen
	filteredCourses := []courseDTO.CourseWithPhases{}
	allowedUsers := []string{keycloak.CourseLecturer, keycloak.CourseEditor, keycloak.CourseStudent}
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

	course, err := GetCourseByID(c, id)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to get course"))
		return
	}

	c.IndentedJSON(http.StatusOK, course)
}

func createCourse(c *gin.Context) {
	userID := c.GetString("userID")

	var newCourse courseDTO.CreateCourse
	if err := c.BindJSON(&newCourse); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateCreateCourse(newCourse); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	course, err := CreateCourse(c, newCourse, userID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to create course"))
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

func getMetaDataGraph(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	graph, err := GetMetaDataGraph(c, courseID)
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

	var graphUpdate courseDTO.UpdateCoursePhaseGraph
	if err := c.BindJSON(&graphUpdate); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateUpdateCourseOrder(c, courseID, graphUpdate.PhaseGraph); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateCoursePhaseOrder(c, courseID, graphUpdate)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to update course phase order"))
		return
	}

	c.Status(http.StatusOK)
}

func updateMetaDataGraph(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newGraph []courseDTO.MetaDataGraphItem
	if err := c.BindJSON(&newGraph); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateMetaDataGraph(c, courseID, newGraph); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateMetaDataGraph(c, courseID, newGraph)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to update meta data order"))
		return
	}

	c.Status(http.StatusOK)
}

func updateCourseData(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var update courseDTO.UpdateCourseData
	if err := c.BindJSON(&update); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateCourseData(c, courseID, update)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to update course data"))
		return
	}

	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
