package coursePhase

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/niclasheun/prompt2.0/keycloak"
)

func setupCoursePhaseRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	coursePhase := router.Group("/course_phases", authMiddleware())
	coursePhase.GET("/:uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer, keycloak.CourseEditor), getCoursePhaseByID)
	coursePhase.POST("", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), createCoursePhase)
	coursePhase.PUT("/:uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), updateCoursePhase)
	coursePhase.DELETE("/:uuid", permissionIDMiddleware(keycloak.PromptAdmin, keycloak.CourseLecturer), deleteCoursePhase)
}

func createCoursePhase(c *gin.Context) {
	var newCoursePhase coursePhaseDTO.CreateCoursePhase
	if err := c.BindJSON(&newCoursePhase); err != nil {
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

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
