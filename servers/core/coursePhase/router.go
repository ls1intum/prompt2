package coursePhase

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	log "github.com/sirupsen/logrus"
)

func setupCoursePhaseRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware, permissionCourseIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	coursePhase := router.Group("/course_phases", authMiddleware())
	coursePhase.GET("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor, permissionValidation.CourseStudent), getCoursePhaseByID)
	coursePhase.GET("/:uuid/course_phase_data", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getPrevPhaseDataByCoursePhaseID)

	// getting the course ID here to do correct rights management
	coursePhase.POST("/course/:courseID", permissionCourseIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), createCoursePhase)
	coursePhase.PUT("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateCoursePhase)
	coursePhase.DELETE("/:uuid", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), deleteCoursePhase)
}

func createCoursePhase(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newCoursePhase coursePhaseDTO.CreateCoursePhase
	if err := c.BindJSON(&newCoursePhase); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// validate that the courseIDs are identical
	if newCoursePhase.CourseID != courseID {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateCreateCoursePhase(newCoursePhase); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	coursePhase, err := CreateCoursePhase(c, newCoursePhase)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusCreated, coursePhase)

}

func getCoursePhaseByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	coursePhase, err := GetCoursePhaseByID(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	// shadow the restricted data for students
	courseTokenIdentifier := c.GetString("courseTokenIdentifier")

	userRoles, exists := c.Get("userRoles")
	if !exists {
		log.Error("userRoles not found in context")
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	userRolesMap, ok := userRoles.(map[string]bool)
	if !ok {
		log.Error("invalid roles format in context")
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	if !hasRestrictedDataAccess(userRolesMap, courseTokenIdentifier) {
		// Hide restricted data for unauthorized users.
		coursePhase.RestrictedData = meta.MetaData{}
	}

	c.IndentedJSON(http.StatusOK, coursePhase)
}

func updateCoursePhase(c *gin.Context) {
	var updatedCoursePhase coursePhaseDTO.UpdateCoursePhase
	if err := c.BindJSON(&updatedCoursePhase); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if err := validateUpdateCoursePhase(updatedCoursePhase); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err := UpdateCoursePhase(c, updatedCoursePhase)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func deleteCoursePhase(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteCoursePhase(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}

func getPrevPhaseDataByCoursePhaseID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// Get resolveLocally Flag from query params
	resolveLocallyParam := c.Query("resolveLocally")
	resolveLocally := false
	if resolveLocallyParam == "true" {
		resolveLocally = true
	}

	coursePhaseData, err := GetPrevPhaseDataByCoursePhaseID(c, id, resolveLocally)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, coursePhaseData)
}

func hasRestrictedDataAccess(userRolesMap map[string]bool, courseTokenIdentifier string) bool {
	return userRolesMap[permissionValidation.PromptAdmin] ||
		userRolesMap[fmt.Sprintf("%s-%s", courseTokenIdentifier, permissionValidation.CourseLecturer)] ||
		userRolesMap[fmt.Sprintf("%s-%s", courseTokenIdentifier, permissionValidation.CourseEditor)]
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
