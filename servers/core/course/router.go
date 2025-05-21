package course

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	log "github.com/sirupsen/logrus"
)

// Id Middleware for all routes with a course id
// Role middleware for all without id -> possible additional filtering in subroutes required
func setupCourseRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionRoleMiddleware, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	course := router.Group("/courses", authMiddleware())
	course.GET("/", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), getAllCourses)
	course.GET("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getCourseByID)
	course.POST("/", permissionRoleMiddleware(permissionValidation.PromptAdmin, permissionValidation.PromptLecturer), createCourse)
	course.PUT("/:uuid/phase_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateCoursePhaseOrder)
	course.GET("/:uuid/phase_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getCoursePhaseGraph)
	course.GET("/:uuid/participation_data_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getParticipationDataGraph)
	course.PUT("/:uuid/participation_data_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateParticipationDataGraph)
	course.GET("/:uuid/phase_data_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getPhaseDataGraph)
	course.PUT("/:uuid/phase_data_graph", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updatePhaseDataGraph)

	course.PUT("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateCourseData)
	course.GET("/self", getOwnCourses)

	course.DELETE("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), deleteCourse)
}

func getOwnCourses(c *gin.Context) {
	matriculationNumber := c.GetString("matriculationNumber")
	universityLogin := c.GetString("universityLogin")

	if matriculationNumber == "" || universityLogin == "" {
		// we need to ensure that it is still usable if you do not have a matriculation number or university login
		// i.e. prompt admins might not have a student role
		log.Debug("no matriculation number or university login found")
		c.IndentedJSON(http.StatusOK, []uuid.UUID{})
		return
	}

	courseIDs, err := GetOwnCourseIDs(c, matriculationNumber, universityLogin)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseIDs)
}

func getAllCourses(c *gin.Context) {
	rolesVal, exists := c.Get("userRoles")
	if !exists {
		handleError(c, http.StatusForbidden, errors.New("missing user roles"))
		return
	}

	userRoles := rolesVal.(map[string]bool)

	courses, err := GetAllCourses(c, userRoles)
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

func getParticipationDataGraph(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	graph, err := GetParticipationDataGraph(c, courseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, graph)
}

func getPhaseDataGraph(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	graph, err := GetPhaseDataGraph(c, courseID)
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

func updateParticipationDataGraph(c *gin.Context) {
	newGraph, courseID, err := parseAndValidateMetaDataGraph(c)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateParticipationDataGraph(c, courseID, newGraph)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to update meta data order"))
		return
	}

	c.Status(http.StatusOK)
}

func updatePhaseDataGraph(c *gin.Context) {
	newGraph, courseID, err := parseAndValidateMetaDataGraph(c)
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdatePhaseDataGraph(c, courseID, newGraph)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to update meta data order"))
		return
	}

	c.Status(http.StatusOK)
}

func parseAndValidateMetaDataGraph(c *gin.Context) ([]courseDTO.MetaDataGraphItem, uuid.UUID, error) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		return nil, uuid.UUID{}, err
	}

	var newGraph []courseDTO.MetaDataGraphItem
	if err := c.BindJSON(&newGraph); err != nil {
		return nil, uuid.UUID{}, err
	}

	if err := validateMetaDataGraph(c, courseID, newGraph); err != nil {
		return nil, uuid.UUID{}, err
	}

	return newGraph, courseID, nil
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

	err = validateUpdateCourseData(update)
	if err != nil {
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

func deleteCourse(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteCourse(c, courseID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("failed to delete course"))
		return
	}

	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
