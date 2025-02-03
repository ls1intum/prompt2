package coursePhaseParticipation

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	"github.com/niclasheun/prompt2.0/keycloakRealmManager"
)

func setupCoursePhaseParticipationRouter(routerGroup *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	courseParticipation := routerGroup.Group("/course_phases/:uuid/participations", authMiddleware())
	courseParticipation.GET("/self", permissionIDMiddleware(keycloakRealmManager.CourseStudent), getOwnCoursePhaseParticipation)
	courseParticipation.GET("", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer, keycloakRealmManager.CourseEditor), getParticipationsForCoursePhase)
	courseParticipation.POST("", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer), createCoursePhaseParticipation)
	courseParticipation.GET("/:participation_uuid", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer, keycloakRealmManager.CourseEditor), getParticipation)
	courseParticipation.PUT("/:participation_uuid", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer), updateCoursePhaseParticipation)
	// allow to modify multiple at once
	courseParticipation.PUT("", permissionIDMiddleware(keycloakRealmManager.PromptAdmin, keycloakRealmManager.CourseLecturer), updateBatchCoursePhaseParticipation)
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
		handleError(c, http.StatusUnauthorized, err)
		return
	}

	courseParticipation, err := GetOwnCoursePhaseParticipation(c, id, matriculationNumber, universityLogin)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
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
	id, err := uuid.Parse(c.Param("participation_uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := GetCoursePhaseParticipation(c, id)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, courseParticipation)
}

func createCoursePhaseParticipation(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("uuid"))
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

	if err := Validate(newCourseParticipation); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipation, err := CreateCoursePhaseParticipation(c, nil, newCourseParticipation)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.IndentedJSON(http.StatusCreated, courseParticipation)
}

func updateCoursePhaseParticipation(c *gin.Context) {
	// this might be uuid.Nil
	id, err := uuid.Parse(c.Param("participation_uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	coursePhaseId, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updatedCourseParticipationRequest coursePhaseParticipationDTO.UpdateCoursePhaseParticipationRequest
	if err := c.BindJSON(&updatedCourseParticipationRequest); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if id == uuid.Nil {
		// Case 1: create a new course phase participation
		createCourseParticipationDTO := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
			CourseParticipationID: updatedCourseParticipationRequest.CourseParticipationID,
			CoursePhaseID:         coursePhaseId,
			PassStatus:            updatedCourseParticipationRequest.PassStatus,
			RestrictedData:        updatedCourseParticipationRequest.RestrictedData,
			StudentReadableData:   updatedCourseParticipationRequest.StudentReadableData,
		}

		if err := Validate(createCourseParticipationDTO); err != nil {
			handleError(c, http.StatusBadRequest, err)
			return
		}

		coursePhaseParticipation, err := CreateCoursePhaseParticipation(c, nil, createCourseParticipationDTO)
		if err != nil {
			handleError(c, http.StatusInternalServerError, err)
			return
		}
		c.IndentedJSON(http.StatusCreated, coursePhaseParticipation.ID)
	} else {
		// Case 2: update an existing course phase participation
		err = UpdateCoursePhaseParticipation(c, nil, coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
			ID:                  id,
			PassStatus:          updatedCourseParticipationRequest.PassStatus,
			RestrictedData:      updatedCourseParticipationRequest.RestrictedData,
			StudentReadableData: updatedCourseParticipationRequest.StudentReadableData,
			CoursePhaseID:       coursePhaseId, // we pass the coursePhaseId to check if the participation is in the correct course phase
		})
		if err != nil {
			handleError(c, http.StatusInternalServerError, err)
			return
		}
		c.IndentedJSON(http.StatusOK, id)
	}
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

	// we filter in the two different kinds
	var createCourseParticipationDTOs []coursePhaseParticipationDTO.CreateCoursePhaseParticipation
	var updateCourseParticipationDTOs []coursePhaseParticipationDTO.UpdateCoursePhaseParticipation
	for _, update := range updatedCourseParticipationRequest {
		if update.ID == uuid.Nil {
			newParticipation := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
				CourseParticipationID: update.CourseParticipationID,
				CoursePhaseID:         coursePhaseId,
				PassStatus:            update.PassStatus,
				RestrictedData:        update.RestrictedData,
				StudentReadableData:   update.StudentReadableData,
			}

			// Validate for complete new participations
			if err := Validate(newParticipation); err != nil {
				handleError(c, http.StatusBadRequest, err)
				return
			}
			createCourseParticipationDTOs = append(createCourseParticipationDTOs, newParticipation)
		} else {
			updateCourseParticipationDTOs = append(updateCourseParticipationDTOs, coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
				ID:                  update.ID,
				PassStatus:          update.PassStatus,
				RestrictedData:      update.RestrictedData,
				StudentReadableData: update.StudentReadableData,
				CoursePhaseID:       coursePhaseId, // we pass the coursePhaseId to check if the participation is in the correct course phase
			})
		}
	}

	ids, err := UpdateBatchCoursePhaseParticipation(c, createCourseParticipationDTOs, updateCourseParticipationDTOs)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.IndentedJSON(http.StatusOK, ids)
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
