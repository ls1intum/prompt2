package evaluations

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationDTO"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

func setupEvaluationRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	evaluationRouter := routerGroup.Group("/evaluation")

	// Admin/Lecturer/Editor endpoints - overview of all evaluations
	evaluationRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAllEvaluationsByPhase)
	evaluationRouter.GET("/self", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getSelfEvaluationsByPhase)
	evaluationRouter.GET("/peer", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getPeerEvaluationsByPhase)
	evaluationRouter.GET("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getSelfEvaluationsForParticipant)
	evaluationRouter.GET("/peer/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getPeerEvaluationsForParticipant)

	// Student endpoints - access to own evaluations only
	evaluationRouter.GET("/my-evaluations", authMiddleware(promptSDK.CourseStudent), getMyEvaluations)
	evaluationRouter.POST("", authMiddleware(promptSDK.CourseStudent), createOrUpdateEvaluation)
	evaluationRouter.DELETE("/:evaluationID", authMiddleware(promptSDK.CourseStudent), deleteEvaluation)
}

func getAllEvaluationsByPhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetEvaluationsByPhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func getSelfEvaluationsByPhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetSelfEvaluationsByPhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func getPeerEvaluationsByPhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetPeerEvaluationsByPhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func getSelfEvaluationsForParticipant(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetSelfEvaluationsForParticipantInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func getPeerEvaluationsForParticipant(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := uuid.Parse(c.Param("courseParticipationID"))
	if err != nil {
		log.Error("Error parsing courseParticipationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	evaluations, err := GetPeerEvaluationsForParticipantInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func getMyEvaluations(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := utils.GetUserCourseParticipationID(c)
	if err != nil {
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(err), err)
		return
	}

	evaluations, err := GetEvaluationsForAuthorInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, evaluations)
}

func createOrUpdateEvaluation(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var request evaluationDTO.CreateOrUpdateEvaluationRequest
	if err := c.BindJSON(&request); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// TODO also check if the assessee is the same as the author or a team member
	statusCode, err := utils.ValidateStudentOwnership(c, request.AuthorCourseParticipationID)
	if err != nil {
		c.JSON(statusCode, gin.H{"error": "Students can only create evaluations as the author"})
		return
	}

	err = CreateOrUpdateEvaluation(c, coursePhaseID, request)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusCreated)
}

func deleteEvaluation(c *gin.Context) {
	evaluationID, err := uuid.Parse(c.Param("evaluationID"))
	if err != nil {
		log.Error("Error parsing evaluationID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, er := utils.GetUserCourseParticipationID(c)
	if er != nil {
		log.Error("Error getting student courseParticipationID: ", er)
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(er), er)
		return
	}

	// Ensure the user is the author of the evaluation or has the right permissions
	if !isEvaluationAuthor(c, evaluationID, courseParticipationID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this evaluation"})
		return
	}

	err = DeleteEvaluation(c, evaluationID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func isEvaluationAuthor(c *gin.Context, evaluationID, authorID uuid.UUID) bool {
	evaluation, err := GetEvaluationByID(c, evaluationID)
	if err != nil {
		log.Error("Error fetching evaluation: ", err)
		return false
	}

	return evaluation.AuthorCourseParticipationID == authorID
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
