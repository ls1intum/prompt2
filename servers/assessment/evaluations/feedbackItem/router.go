package feedbackItem

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/feedbackItem/feedbackItemDTO"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

func setupFeedbackItemRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	feedbackItemRouter := routerGroup.Group("/evaluation/feedback-items")

	feedbackItemRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), listFeedbackItemsForCoursePhase)
	feedbackItemRouter.GET("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getFeedbackItemsForParticipantInPhase)
	feedbackItemRouter.GET("/tutor/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), getFeedbackItemsForTutorInPhase)

	// Student endpoints - access to own feedback items only
	feedbackItemRouter.GET("/my-feedback", authMiddleware(promptSDK.CourseStudent), getMyFeedbackItems)
	feedbackItemRouter.POST("", authMiddleware(promptSDK.CourseStudent), createFeedbackItem)
	feedbackItemRouter.PUT("/:feedbackItemID", authMiddleware(promptSDK.CourseStudent), updateFeedbackItem)
	feedbackItemRouter.DELETE("/:feedbackItemID", authMiddleware(promptSDK.CourseStudent), deleteFeedbackItem)
}

func listFeedbackItemsForCoursePhase(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	feedbackItems, err := ListFeedbackItemsForCoursePhase(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, feedbackItems)
}

func getFeedbackItemsForParticipantInPhase(c *gin.Context) {
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

	feedbackItems, err := ListFeedbackItemsForParticipantInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, feedbackItems)
}

func getFeedbackItemsForTutorInPhase(c *gin.Context) {
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

	feedbackItems, err := ListFeedbackItemsForTutorInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, feedbackItems)
}

func getMyFeedbackItems(c *gin.Context) {
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

	feedbackItems, err := ListFeedbackItemsByAuthorInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, feedbackItems)
}

func createFeedbackItem(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var req feedbackItemDTO.CreateFeedbackItemRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := utils.GetUserCourseParticipationID(c)
	if err != nil {
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(err), err)
		return
	}

	// Students can only create feedback items where they are the author
	if req.AuthorCourseParticipationID != courseParticipationID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Students can only create feedback items as the author"})
		return
	}

	req.CoursePhaseID = coursePhaseID

	err = CreateFeedbackItem(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Feedback item created successfully"})
}

func updateFeedbackItem(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		log.Error("Error parsing coursePhaseID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var req feedbackItemDTO.UpdateFeedbackItemRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	statusCode, err := utils.ValidateStudentOwnership(c, req.AuthorCourseParticipationID)
	if err != nil {
		handleError(c, statusCode, err)
		return
	}

	req.CoursePhaseID = coursePhaseID

	err = UpdateFeedbackItem(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Feedback item updated successfully"})
}

func deleteFeedbackItem(c *gin.Context) {
	feedbackItemID, err := uuid.Parse(c.Param("feedbackItemID"))
	if err != nil {
		log.Error("Error parsing feedbackItemID: ", err)
		handleError(c, http.StatusBadRequest, err)
		return
	}

	courseParticipationID, err := utils.GetUserCourseParticipationID(c)
	if err != nil {
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(err), err)
		return
	}
	if !IsFeedbackItemAuthor(c, feedbackItemID, courseParticipationID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this feedback item"})
		return
	}

	err = DeleteFeedbackItem(c, feedbackItemID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
