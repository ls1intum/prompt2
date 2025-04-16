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
	assessmentRouter := routerGroup.Group("/student-assessment")

	assessmentRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), listAssessmentsByCoursePhase)
	assessmentRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), createAssessment)
	assessmentRouter.PUT("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateAssessment)
	assessmentRouter.GET("/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getStudentAssessment)
	assessmentRouter.GET("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), listAssessmentsByStudentInPhase)
	assessmentRouter.GET("/remaining/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), countRemainingAssessmentsForStudent)
	assessmentRouter.DELETE("/:assessmentID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteAssessment)

	assessmentRouter.GET("/competency/:competencyID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByCompetencyInPhase)
	assessmentRouter.GET("/category/:categoryID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listAssessmentsByCategoryInPhase)
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

func createAssessment(c *gin.Context) {
	var req assessmentDTO.CreateOrUpdateAssessmentRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err := CreateAssessment(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Assessment created successfully"})
}

func updateAssessment(c *gin.Context) {
	var req assessmentDTO.CreateOrUpdateAssessmentRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err := UpdateAssessment(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Assessment updated successfully"})
}

func getStudentAssessment(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	studentAssessment, err := GetStudentAssessment(c, coursePhaseID, courseParticipationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, studentAssessment)
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

func listAssessmentsByCompetencyInPhase(c *gin.Context) {
	competencyID, err := uuid.Parse(c.Param("competencyID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByCompetencyInPhase(c, competencyID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func listAssessmentsByCategoryInPhase(c *gin.Context) {
	categoryID, err := uuid.Parse(c.Param("categoryID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	assessments, err := ListAssessmentsByCategoryInPhase(c, categoryID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, assessmentDTO.GetAssessmentDTOsFromDBModels(assessments))
}

func countRemainingAssessmentsForStudent(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	remainingAssessments, err := CountRemainingAssessmentsForStudent(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, assessmentDTO.MapToRemainingAssessmentsDTO(remainingAssessments))
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
