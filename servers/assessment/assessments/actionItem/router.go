package actionItem

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/actionItem/actionItemDTO"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	"github.com/ls1intum/prompt2/servers/assessment/utils"
	log "github.com/sirupsen/logrus"
)

func setupActionItemRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	actionItemRouter := routerGroup.Group("student-assessment/action-item")

	// course phase communication
	actionItemRouter.GET("/action", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getAllActionItemsForCoursePhaseCommunication)
	actionItemRouter.GET("/action/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getStudentActionItemsForCoursePhaseCommunication)

	// action item management
	actionItemRouter.GET("/course-participation/:courseParticipationID", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), getActionItemsForStudent)
	actionItemRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), createActionItem)
	actionItemRouter.PUT("/:id", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateActionItem)
	actionItemRouter.DELETE("/:id", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), deleteActionItem)

	// student access to own action items
	actionItemRouter.GET("/my-action-items", authMiddleware(promptSDK.CourseStudent), getMyActionItems)
}

func getAllActionItemsForCoursePhaseCommunication(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	actionItems, err := GetAllActionItemsForCoursePhaseCommunication(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, actionItems)
}

func getStudentActionItemsForCoursePhaseCommunication(c *gin.Context) {
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

	actionItems, err := GetStudentActionItemsForCoursePhaseCommunication(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, actionItems)
}

func createActionItem(c *gin.Context) {
	var req actionItemDTO.CreateActionItemRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}
	err := CreateActionItem(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Action item created successfully"})
}

func updateActionItem(c *gin.Context) {
	actionItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	var req actionItemDTO.UpdateActionItemRequest
	if err := c.BindJSON(&req); err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	// Ensure the ID from URL matches the one in the request
	req.ID = actionItemID

	err = UpdateActionItem(c, req)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Action item updated successfully"})
}

func deleteActionItem(c *gin.Context) {
	actionItemID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	err = DeleteActionItem(c, actionItemID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func getActionItemsForStudent(c *gin.Context) {
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

	actionItems, err := ListActionItemsForStudentInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, actionItems)
}

func getMyActionItems(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		handleError(c, http.StatusBadRequest, err)
		return
	}

	config, err := coursePhaseConfig.GetCoursePhaseConfig(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	if !config.ActionItemsVisible {
		handleError(c, http.StatusForbidden, fmt.Errorf("action items are not visible to students"))
		return
	}

	deadlinePassed, err := coursePhaseConfig.IsAssessmentDeadlinePassed(c, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	if !deadlinePassed {
		c.JSON(http.StatusOK, make([]actionItemDTO.ActionItem, 0))
		return
	}

	courseParticipationID, err := utils.GetUserCourseParticipationID(c)
	if err != nil {
		handleError(c, utils.GetUserCourseParticipationIDErrorStatus(err), err)
		return
	}

	exists, err := assessmentCompletion.CheckAssessmentCompletionExists(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	if exists {
		completion, err := assessmentCompletion.GetAssessmentCompletion(c, courseParticipationID, coursePhaseID)
		if err != nil {
			handleError(c, http.StatusInternalServerError, err)
			return
		}
		if !completion.Completed {
			c.Status(http.StatusNoContent)
			return
		}
	}

	actionItems, err := ListActionItemsForStudentInPhase(c, courseParticipationID, coursePhaseID)
	if err != nil {
		handleError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, actionItems)
}

func handleError(c *gin.Context, statusCode int, err error) {
	log.Error(err)
	c.JSON(statusCode, gin.H{"error": err.Error()})
}
