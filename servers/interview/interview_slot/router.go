package interview_slot

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	promptSDK "github.com/ls1intum/prompt-sdk"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
	interviewSlotDTO "github.com/ls1intum/prompt2/servers/interview/interview_slot/interviewSlotDTO"
	log "github.com/sirupsen/logrus"
)

var _ db.InterviewSlot

func setupInterviewSlotRouter(routerGroup *gin.RouterGroup, authMiddleware func(allowedRoles ...string) gin.HandlerFunc) {
	interviewRouter := routerGroup.Group("/interview-slots")

	// Admin routes - manage interview slots
	interviewRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), createInterviewSlot)
	interviewRouter.GET("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.PromptLecturer, promptSDK.CourseStudent), getAllInterviewSlots)
	interviewRouter.GET("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.PromptLecturer, promptSDK.CourseStudent), getInterviewSlot)
	interviewRouter.PUT("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), updateInterviewSlot)
	interviewRouter.DELETE("/:slotId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), deleteInterviewSlot)

	// Student routes - book interview slots
	assignmentRouter := routerGroup.Group("/interview-assignments")
	assignmentRouter.POST("", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.PromptLecturer, promptSDK.CourseStudent), createInterviewAssignment)
	assignmentRouter.POST("/admin", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor), createInterviewAssignmentAdmin)
	assignmentRouter.GET("/my-assignment", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.PromptLecturer, promptSDK.CourseStudent), getMyInterviewAssignment)
	assignmentRouter.DELETE("/:assignmentId", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer, promptSDK.CourseEditor, promptSDK.PromptLecturer, promptSDK.CourseStudent), deleteInterviewAssignment)
}

func writeServiceError(c *gin.Context, err error) {
	var serviceErr *ServiceError
	if errors.As(err, &serviceErr) {
		c.JSON(serviceErr.StatusCode, gin.H{"error": serviceErr.Message})
		return
	}

	log.Errorf("Unexpected interview slot service error: %v", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
}

func getCourseParticipationID(c *gin.Context) (uuid.UUID, error) {
	courseParticipationID, exists := c.Get("courseParticipationID")
	if !exists {
		return uuid.Nil, errors.New("course participation ID not found")
	}

	switch value := courseParticipationID.(type) {
	case uuid.UUID:
		return value, nil
	case string:
		parsedID, err := uuid.Parse(value)
		if err != nil {
			return uuid.Nil, err
		}
		return parsedID, nil
	default:
		return uuid.Nil, errors.New("invalid course participation ID")
	}
}

// createInterviewSlot godoc
// @Summary Create a new interview slot
// @Description Creates a new interview time slot for the course phase
// @Tags interview-slots
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param request body interviewSlotDTO.CreateInterviewSlotRequest true "Interview slot details"
// @Success 201 {object} db.InterviewSlot
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-slots [post]
func createInterviewSlot(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var req interviewSlotDTO.CreateInterviewSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slot, err := CreateInterviewSlot(c.Request.Context(), coursePhaseID, req)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, slot)
}

// getAllInterviewSlots godoc
// @Summary Get all interview slots for a course phase
// @Description Retrieves all interview slots with assignment details
// @Tags interview-slots
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Success 200 {array} interviewSlotDTO.InterviewSlotResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-slots [get]
func getAllInterviewSlots(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slots, err := GetAllInterviewSlots(c.Request.Context(), coursePhaseID, c.GetHeader("Authorization"))
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, slots)
}

// getInterviewSlot godoc
// @Summary Get a specific interview slot
// @Description Retrieves details of a specific interview slot
// @Tags interview-slots
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param slotId path string true "Interview Slot UUID"
// @Success 200 {object} interviewSlotDTO.InterviewSlotResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [get]
func getInterviewSlot(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	slot, err := GetInterviewSlot(c.Request.Context(), coursePhaseID, slotID, c.GetHeader("Authorization"))
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, slot)
}

// updateInterviewSlot godoc
// @Summary Update an interview slot
// @Description Updates an existing interview slot
// @Tags interview-slots
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param slotId path string true "Interview Slot UUID"
// @Param request body interviewSlotDTO.UpdateInterviewSlotRequest true "Updated slot details"
// @Success 200 {object} db.InterviewSlot
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [put]
func updateInterviewSlot(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	var req interviewSlotDTO.UpdateInterviewSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slot, err := UpdateInterviewSlot(c.Request.Context(), coursePhaseID, slotID, req)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, slot)
}

// deleteInterviewSlot godoc
// @Summary Delete an interview slot
// @Description Deletes an interview slot and all its assignments
// @Tags interview-slots
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param slotId path string true "Interview Slot UUID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [delete]
func deleteInterviewSlot(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	if err := DeleteInterviewSlot(c.Request.Context(), coursePhaseID, slotID); err != nil {
		writeServiceError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}

// createInterviewAssignment godoc
// @Summary Assign current user to an interview slot
// @Description Students can book themselves into an available interview slot
// @Tags interview-assignments
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param request body interviewSlotDTO.CreateInterviewAssignmentRequest true "Assignment details"
// @Success 201 {object} interviewSlotDTO.InterviewAssignmentResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-assignments [post]
func createInterviewAssignment(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var req interviewSlotDTO.CreateInterviewAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	participationID, err := getCourseParticipationID(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course participation ID not found"})
		return
	}

	response, err := CreateInterviewAssignment(c.Request.Context(), coursePhaseID, participationID, req)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, response)
}

// createInterviewAssignmentAdmin godoc
// @Summary Manually assign a student to an interview slot (Admin only)
// @Description Allows admins/lecturers to manually assign any student to an interview slot
// @Tags interview-assignments
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param request body interviewSlotDTO.CreateInterviewAssignmentAdminRequest true "Assignment details with course participation ID"
// @Success 201 {object} interviewSlotDTO.InterviewAssignmentResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-assignments/admin [post]
func createInterviewAssignmentAdmin(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var req interviewSlotDTO.CreateInterviewAssignmentAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := CreateInterviewAssignmentAdmin(c.Request.Context(), coursePhaseID, req)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, response)
}

// getMyInterviewAssignment godoc
// @Summary Get current user's interview assignment
// @Description Retrieves the interview assignment for the current student
// @Tags interview-assignments
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Success 200 {object} interviewSlotDTO.InterviewAssignmentResponse
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-assignments/my-assignment [get]
func getMyInterviewAssignment(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	response, err := GetMyInterviewAssignment(c.Request.Context(), coursePhaseID, c.GetHeader("Authorization"))
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, response)
}

// deleteInterviewAssignment godoc
// @Summary Delete an interview assignment
// @Description Removes a student's assignment to an interview slot
// @Tags interview-assignments
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param assignmentId path string true "Assignment UUID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /course_phase/{coursePhaseID}/interview-assignments/{assignmentId} [delete]
func deleteInterviewAssignment(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	assignmentID, err := uuid.Parse(c.Param("assignmentId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	userRoles, exists := c.Get("userRoles")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User roles not found"})
		return
	}

	roles, ok := userRoles.([]string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user roles"})
		return
	}

	err = DeleteInterviewAssignment(c.Request.Context(), coursePhaseID, assignmentID, c.GetHeader("Authorization"), roles)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.Status(http.StatusNoContent)
}
