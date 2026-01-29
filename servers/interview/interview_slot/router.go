package interview_slot

import (
	"github.com/gin-gonic/gin"
	promptSDK "github.com/ls1intum/prompt-sdk"
)

func setupInterviewSlotRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	interviewRouter := routerGroup.Group("/interview-slots")

	// Admin routes - manage interview slots
	interviewRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createInterviewSlot)
	interviewRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.PromptLecturer, promptSDK.CourseStudent), getAllInterviewSlots)
	interviewRouter.GET("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.PromptLecturer, promptSDK.CourseStudent), getInterviewSlot)
	interviewRouter.PUT("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), updateInterviewSlot)
	interviewRouter.DELETE("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), deleteInterviewSlot)

	// Student routes - book interview slots
	assignmentRouter := routerGroup.Group("/interview-assignments")
	assignmentRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.PromptLecturer, promptSDK.CourseStudent), createInterviewAssignment)
	assignmentRouter.POST("/admin", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), createInterviewAssignmentAdmin)
	assignmentRouter.GET("/my-assignment", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.PromptLecturer, promptSDK.CourseStudent), getMyInterviewAssignment)
	assignmentRouter.DELETE("/:assignmentId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.PromptLecturer, promptSDK.CourseStudent), deleteInterviewAssignment)
}
