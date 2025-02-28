package applicationAdministration

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	"github.com/niclasheun/prompt2.0/mailing"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	log "github.com/sirupsen/logrus"
)

func setupApplicationRouter(router *gin.RouterGroup, authMiddleware func() gin.HandlerFunc, applicationMiddleware func() gin.HandlerFunc, permissionIDMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	application := router.Group("/applications", authMiddleware())

	// Application Form Endpoints
	application.GET("/:coursePhaseID/form", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getApplicationForm)
	application.PUT("/:coursePhaseID/form", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateApplicationForm)
	application.GET("/:coursePhaseID/score", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), getAdditionalScores)
	application.POST("/:coursePhaseID/score", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), uploadAdditionalScore)
	application.PUT("/:coursePhaseID/assessment", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateApplicationsStatus)

	application.POST("/:coursePhaseID", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), postApplicationManual)
	application.DELETE("/:coursePhaseID", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), deleteApplications)

	application.GET("/:coursePhaseID/:courseParticipationID", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getApplicationByCPID)
	application.PUT("/:coursePhaseID/:courseParticipationID/assessment", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer), updateApplicationAssessment)

	application.GET("/:coursePhaseID/participations", permissionIDMiddleware(permissionValidation.PromptAdmin, permissionValidation.CourseLecturer, permissionValidation.CourseEditor), getAllApplicationParticipations)

	// Apply Endpoints - No Authentication needed
	apply := router.Group("/apply")
	apply.GET("", getAllOpenApplications)
	apply.GET("/:coursePhaseID", getApplicationFormWithCourseDetails)
	apply.POST("/:coursePhaseID", postApplicationExtern)

	applyAuthenticated := router.Group("/apply/authenticated", applicationMiddleware())
	applyAuthenticated.GET("/:coursePhaseID", getApplicationAuthenticated)
	applyAuthenticated.POST("/:coursePhaseID", postApplicationAuthenticated)

}

func getApplicationForm(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applicationForm, err := GetApplicationForm(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}

	c.IndentedJSON(http.StatusOK, applicationForm)

}

func updateApplicationForm(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var updatedApplicationForm applicationDTO.UpdateForm
	if err := c.BindJSON(&updatedApplicationForm); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateUpdateForm(c, coursePhaseId, updatedApplicationForm)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateApplicationForm(c, coursePhaseId, updatedApplicationForm)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not update application form"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "application form updated"})
}

func getAllOpenApplications(c *gin.Context) {
	openApplications, err := GetOpenApplicationPhases(c)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get open applications"))
		return
	}

	c.IndentedJSON(http.StatusOK, openApplications)
}

func getApplicationFormWithCourseDetails(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applicationForm, err := GetApplicationFormWithDetails(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrNotFound) {
			handleError(c, http.StatusNotFound, errors.New("application not found"))
			return
		}
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}

	c.IndentedJSON(http.StatusOK, applicationForm)
}

func getApplicationAuthenticated(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	userEmail := c.GetString("userEmail")

	if userEmail == "" {
		handleError(c, http.StatusUnauthorized, errors.New("no user email found"))
		return
	}

	// TODO: maybe rewrite in near future to MatrNr as this is safer to not change!
	applicationForm, err := GetApplicationAuthenticatedByEmail(c, userEmail, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get application form"))
		return
	}
	c.IndentedJSON(http.StatusOK, applicationForm)

}

func postApplicationManual(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	var application applicationDTO.PostApplication
	if err := c.BindJSON(&application); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateApplicationManualAdd(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := PostApplicationAuthenticatedStudent(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrAlreadyApplied) {
			handleError(c, http.StatusMethodNotAllowed, errors.New("already applied"))
			return
		}

		handleError(c, http.StatusInternalServerError, errors.New("could not post application"))
		return
	}

	err = mailing.SendApplicationConfirmationMail(c, coursePhaseId, courseParticipationID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not send confirmation mail"))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "application posted"})
}

func postApplicationExtern(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var application applicationDTO.PostApplication
	if err := c.BindJSON(&application); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateApplication(c, coursePhaseId, application, false)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := PostApplicationExtern(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrAlreadyApplied) {
			handleError(c, http.StatusMethodNotAllowed, errors.New("already applied"))
			return
		} else if errors.Is(err, ErrStudentDetailsDoNotMatch) {
			handleError(c, http.StatusConflict, errors.New("student exists but details do not match"))
			return
		}

		handleError(c, http.StatusInternalServerError, errors.New("could not post application"))
		return
	}

	err = mailing.SendApplicationConfirmationMail(c, coursePhaseId, courseParticipationID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not send confirmation mail"))
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "application posted"})
}

func postApplicationAuthenticated(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	userEmail := c.GetString("userEmail")
	matriculationNumber := c.GetString("matriculationNumber")
	universityLogin := c.GetString("universityLogin")
	firstName := c.GetString("firstName")
	lastName := c.GetString("lastName")
	if userEmail == "" {
		handleError(c, http.StatusUnauthorized, errors.New("no user email found"))
		return
	}

	var application applicationDTO.PostApplication
	if err := c.BindJSON(&application); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateApplication(c, coursePhaseId, application, true)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	if application.Student.Email != userEmail ||
		application.Student.MatriculationNumber != matriculationNumber ||
		application.Student.UniversityLogin != universityLogin ||
		application.Student.FirstName != firstName ||
		application.Student.LastName != lastName {
		handleError(c, http.StatusUnauthorized, errors.New("credentials do not match payload"))
		return
	}

	courseParticipationID, err := PostApplicationAuthenticatedStudent(c, coursePhaseId, application)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not post application"))
		return
	}

	err = mailing.SendApplicationConfirmationMail(c, coursePhaseId, courseParticipationID)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not send confirmation mail"))
		return
	}

	// TODO: send mail confirmation to student!
	c.JSON(http.StatusCreated, gin.H{"message": "application posted"})
}

func getApplicationByCPID(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	application, err := GetApplicationByCPID(c, coursePhaseId, courseParticipationID)
	if err != nil {
		log.Error(err)
		if errors.Is(err, ErrNotFound) {
			handleError(c, http.StatusNotFound, errors.New("application not found"))
			return
		}
		handleError(c, http.StatusInternalServerError, errors.New("could not get application"))
		return
	}

	c.IndentedJSON(http.StatusOK, application)
}

func getAllApplicationParticipations(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	applications, err := GetAllApplicationParticipations(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get applications"))
		return
	}

	c.IndentedJSON(http.StatusOK, applications)
}

func updateApplicationAssessment(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationId, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var assessment applicationDTO.PutAssessment
	if err := c.BindJSON(&assessment); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateUpdateAssessment(c, coursePhaseId, courseParticipationId, assessment)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UpdateApplicationAssessment(c, coursePhaseId, courseParticipationId, assessment)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not update application assessment"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "application assessment updated"})
}

func uploadAdditionalScore(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var additionalScore applicationDTO.AdditionalScoreUpload
	if err := c.BindJSON(&additionalScore); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = validateAdditionalScore(additionalScore)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = UploadAdditionalScore(c, coursePhaseId, additionalScore)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not upload additional score"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "additional score uploaded"})
}

func getAdditionalScores(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	additionalScore, err := GetAdditionalScores(c, coursePhaseId)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not get additional score"))
		return
	}

	c.IndentedJSON(http.StatusOK, additionalScore)
}

func updateApplicationsStatus(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var status coursePhaseParticipationDTO.UpdateCoursePhaseParticipationStatus
	if err := c.BindJSON(&status); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	participationIDs, err := coursePhaseParticipation.BatchUpdatePassStatus(c, coursePhaseId, status.CourseParticipationIDs, status.PassStatus)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not update application status"))
		return
	}
	log.Info("Updated ", len(participationIDs), " participations")

	c.JSON(http.StatusOK, gin.H{"message": "application status updated"})
}

func deleteApplications(c *gin.Context) {
	coursePhaseId, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var courseParticipationIDs []uuid.UUID
	if err := c.BindJSON(&courseParticipationIDs); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteApplications(c, coursePhaseId, courseParticipationIDs)
	if err != nil {
		log.Error(err)
		handleError(c, http.StatusInternalServerError, errors.New("could not delete applications"))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "applications deleted"})
}

func handleError(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
