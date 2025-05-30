package coursePhaseParticipation

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	log "github.com/sirupsen/logrus"
)

func setupCoursePhaseParticipationRouter(routerGroup *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	courseParticipation := routerGroup.Group("/course_phases/:uuid/participations", authMiddleware())
	courseParticipation.GET("/self", permissionIDMiddleware(permissionValidation.CourseStudent), getOwnCoursePhaseParticipation)
	courseParticipation.GET("", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getParticipationsForCoursePhase)
	courseParticipation.GET("/:course_participation_id", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getParticipation)
	courseParticipation.PUT("/:course_participation_id", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateCoursePhaseParticipation)
	// allow to modify multiple at once
	courseParticipation.PUT("", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateBatchCoursePhaseParticipation)

	// get the students data of the participations
	courseParticipation.GET("/students", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), getStudentsOfCoursePhase)
}

func getOwnCoursePhaseParticipation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	matriculationNumber := c.GetString("matriculationNumber")
	universityLogin := c.GetString("universityLogin")

	if matriculationNumber == "" || universityLogin == "" {
		handleError(c, http.StatusUnauthorized, errors.New("missing matriculation number or university login"))
		return
	}

	coursePhaseParticipation, err := GetOwnCoursePhaseParticipation(c, id, matriculationNumber, universityLogin)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			handleError(c, http.StatusNotFound, errors.New("course phase participation not found"))
			return
		}
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, coursePhaseParticipation)
}

func getParticipationsForCoursePhase(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipations, err := GetAllParticipationsForCoursePhase(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipations)
}

func getParticipation(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("course_participation_id"))
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := GetCoursePhaseParticipation(c, coursePhaseID, courseParticipationID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
}

func updateCoursePhaseParticipation(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("course_participation_id"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var newCourseParticipation coursePhaseParticipationDTO.CreateCoursePhaseParticipation
	if err := c.BindJSON(&newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	newCourseParticipation.CoursePhaseID = coursePhaseID
	newCourseParticipation.CourseParticipationID = courseParticipationID

	if err := Validate(newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := CreateOrUpdateCoursePhaseParticipation(c, nil, newCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusCreated, courseParticipation)
}

func updateBatchCoursePhaseParticipation(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// we expect an array of updates
	var updatedCourseParticipationRequest []coursePhaseParticipationDTO.UpdateCoursePhaseParticipationRequest
	if err := c.BindJSON(&updatedCourseParticipationRequest); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var createOrUpdateCourseParticipationDTOs []coursePhaseParticipationDTO.CreateCoursePhaseParticipation
	for _, update := range updatedCourseParticipationRequest {
		if update.CoursePhaseID != coursePhaseId {
			handleError(c, http.StatusBadRequest, errors.New("coursePhaseID in request does not match coursePhaseID in URL"))
			return
		}

		dbParticipation := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
			CourseParticipationID: update.CourseParticipationID,
			CoursePhaseID:         coursePhaseId, // we only update for one coursePhaseID
			PassStatus:            update.PassStatus,
			RestrictedData:        update.RestrictedData,
			StudentReadableData:   update.StudentReadableData,
		}

		// Validate for complete new participations
		if err := Validate(dbParticipation); err != nil {
			handleError(c, http.StatusBadRequest, err)
			return
		}
		createOrUpdateCourseParticipationDTOs = append(createOrUpdateCourseParticipationDTOs, dbParticipation)
	}

	ids, err := UpdateBatchCoursePhaseParticipation(c, createOrUpdateCourseParticipationDTOs)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, ids)
}

func getStudentsOfCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	students, err := GetStudentsOfCoursePhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, students)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
