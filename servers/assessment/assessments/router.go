package assessments

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentDTO"
	log "github.com/sirupsen/logrus"
)

func setupAssessmentRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	assessmentRouter := routerGroup.Group("/assessment")

	assessmentRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createOrUpdateAssessment)
	assessmentRouter.GET("/:assessmentID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getAssessment)
	assessmentRouter.DELETE("/:assessmentID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteAssessment)

	assessmentRouter.GET("/by-coursephase", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByCoursePhase)
	assessmentRouter.GET("/:courseParticipationID/by-student", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByStudent)
	assessmentRouter.GET("/:courseParticipationID/by-student-in-phase", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByStudentInPhase)
	assessmentRouter.GET("/by-competency/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByCompetency)
	assessmentRouter.GET("/by-category/:categoryID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByCategory)
}

func createOrUpdateAssessment(c *gin.Context) {
	var req assessmentDTO.CreateOrUpdateAssessmentRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessment, err := CreateOrUpdateAssessment(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessment)
}

func getAssessment(c *gin.Context) {
	assessmentID, err := uuid.Parse(c.Param("assessmentID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessment, err := GetAssessment(c, assessmentID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessment)
}

func deleteAssessment(c *gin.Context) {
	assessmentID, err := uuid.Parse(c.Param("assessmentID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	if err := DeleteAssessment(c, assessmentID); err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func listAssessmentsByCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByCoursePhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func listAssessmentsByStudent(c *gin.Context) {
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByStudent(c, courseParticipationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func listAssessmentsByStudentInPhase(c *gin.Context) {
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByStudentInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func listAssessmentsByCompetency(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByCompetency(c, competencyID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func listAssessmentsByCategory(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("categoryID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByCategory(c, categoryID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
