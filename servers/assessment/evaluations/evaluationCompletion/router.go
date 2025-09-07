package evaluationCompletion

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationCompletion/evaluationCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

func setupEvaluationCompletionRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	evaluationRouter := routerGroup.Group("/evaluation/completed")

	evaluationRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), listEvaluationCompletionsByCoursePhase)

	evaluationRouter.POST("/my-completion", authMiddleware(promptSDK.CourseStudent), createOrUpdateMyEvaluationCompletion)
	evaluationRouter.PUT("/my-completion", authMiddleware(promptSDK.CourseStudent), createOrUpdateMyEvaluationCompletion)
	evaluationRouter.POST("/my-completion/mark-complete", authMiddleware(promptSDK.CourseStudent), markMyEvaluationAsCompleted)
	evaluationRouter.PUT("/my-completion/unmark", authMiddleware(promptSDK.CourseStudent), unmarkMyEvaluationAsCompleted)
	evaluationRouter.GET("/my-completions", authMiddleware(promptSDK.CourseStudent), getMyEvaluationCompletions)

}

func listEvaluationCompletionsByCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	completions, err := ListEvaluationCompletionsByCoursePhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluationCompletionDTO.GetEvaluationCompletionDTOsFromDBModels(completions))
}

func createOrUpdateMyEvaluationCompletion(c *gin.Context) {
	var req evaluationCompletionDTO.EvaluationCompletion
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	statusCode, err := utils.ValidateStudentOwnership(c, req.AuthorCourseParticipationID)
	if err != nil {
		handleError(c, statusCode, err)
		return
	}

	err = CreateOrUpdateEvaluationCompletion(c, req)
	if err != nil {
		if errors.Is(err, coursePhaseConfig.ErrNotStarted) {
			handleError(c, http.StatusForbidden, err)
			return
		}
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Evaluation completion created/updated successfully"})
}

func markMyEvaluationAsCompleted(c *gin.Context) {
	var req evaluationCompletionDTO.EvaluationCompletion
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	statusCode, err := utils.ValidateStudentOwnership(c, req.AuthorCourseParticipationID)
	if err != nil {
		handleError(c, statusCode, err)
		return
	}

	err = MarkEvaluationAsCompleted(c, req)
	if err != nil {
		if errors.Is(err, coursePhaseConfig.ErrNotStarted) {
			handleError(c, http.StatusForbidden, err)
			return
		}
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Evaluation marked as completed successfully"})
}

func unmarkMyEvaluationAsCompleted(c *gin.Context) {
	var req struct {
		CourseParticipationID       uuid.UUID `json:"courseParticipationID"`
		CoursePhaseID               uuid.UUID `json:"coursePhaseID"`
		AuthorCourseParticipationID uuid.UUID `json:"authorCourseParticipationID"`
	}
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	statusCode, err := utils.ValidateStudentOwnership(c, req.AuthorCourseParticipationID)
	if err != nil {
		handleError(c, statusCode, err)
		return
	}

	if err := UnmarkEvaluationAsCompleted(c, req.CourseParticipationID, req.CoursePhaseID, req.AuthorCourseParticipationID); err != nil {
		if errors.Is(err, coursePhaseConfig.ErrDeadlinePassed) {
			handleError(c, http.StatusForbidden, err)
		} else {
			handleError(c, http.StatusInternalServerError, err)
		}
		return
	}
	c.Status(http.StatusOK)
}

func getMyEvaluationCompletions(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	userCourseParticipationUUID, err := utils.GetUserCourseParticipationID(c)
	if err != nil {
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(err), err)
		return
	}

	evaluationCompletions, err := GetEvaluationCompletionsForAuthorInPhase(c, userCourseParticipationUUID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, evaluationCompletionDTO.GetEvaluationCompletionDTOsFromDBModels(evaluationCompletions))
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
