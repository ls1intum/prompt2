package interview_slot

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type InterviewSlotService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var InterviewSlotServiceSingleton *InterviewSlotService

type CreateInterviewSlotRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Location  *string   `json:"location"`
	Capacity  int32     `json:"capacity" binding:"required,min=1"`
}

type UpdateInterviewSlotRequest struct {
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Location  *string   `json:"location"`
	Capacity  int32     `json:"capacity" binding:"required,min=1"`
}

type CreateInterviewAssignmentRequest struct {
	InterviewSlotID uuid.UUID `json:"interview_slot_id" binding:"required"`
}

type InterviewSlotResponse struct {
	ID            uuid.UUID `json:"id"`
	CoursePhaseID uuid.UUID `json:"course_phase_id"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
	Location      *string   `json:"location"`
	Capacity      int32     `json:"capacity"`
	AssignedCount int64     `json:"assigned_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Helper functions for type conversion
func timeToPgTimestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func pgTimestamptzToTime(ts pgtype.Timestamptz) time.Time {
	if ts.Valid {
		return ts.Time
	}
	return time.Time{}
}

func stringPtrToPgText(s *string) pgtype.Text {
	if s != nil && *s != "" {
		return pgtype.Text{String: *s, Valid: true}
	}
	return pgtype.Text{Valid: false}
}

func pgTextToStringPtr(t pgtype.Text) *string {
	if t.Valid {
		return &t.String
	}
	return nil
}

type InterviewAssignmentResponse struct {
	ID                    uuid.UUID              `json:"id"`
	InterviewSlotID       uuid.UUID              `json:"interview_slot_id"`
	CourseParticipationID uuid.UUID              `json:"course_participation_id"`
	AssignedAt            time.Time              `json:"assigned_at"`
	SlotDetails           *InterviewSlotResponse `json:"slot_details,omitempty"`
}

// createInterviewSlot godoc
// @Summary Create a new interview slot
// @Description Creates a new interview time slot for the course phase
// @Tags interview-slots
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param request body CreateInterviewSlotRequest true "Interview slot details"
// @Success 201 {object} db.InterviewSlot
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-slots [post]
func createInterviewSlot(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var req CreateInterviewSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.EndTime.Before(req.StartTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	slot, err := InterviewSlotServiceSingleton.queries.CreateInterviewSlot(context.Background(), db.CreateInterviewSlotParams{
		CoursePhaseID: coursePhaseID,
		StartTime:     timeToPgTimestamptz(req.StartTime),
		EndTime:       timeToPgTimestamptz(req.EndTime),
		Location:      stringPtrToPgText(req.Location),
		Capacity:      req.Capacity,
	})

	if err != nil {
		log.Errorf("Failed to create interview slot: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create interview slot"})
		return
	}

	c.JSON(http.StatusCreated, slot)
}

// getAllInterviewSlots godoc
// @Summary Get all interview slots for a course phase
// @Description Retrieves all interview slots with assignment counts
// @Tags interview-slots
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Success 200 {array} InterviewSlotResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-slots [get]
func getAllInterviewSlots(c *gin.Context) {
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slots, err := InterviewSlotServiceSingleton.queries.GetInterviewSlotsByCoursePhase(context.Background(), coursePhaseID)
	if err != nil {
		log.Errorf("Failed to get interview slots: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slots"})
		return
	}

	// Get assignment counts for each slot
	response := make([]InterviewSlotResponse, len(slots))
	for i, slot := range slots {
		count, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), slot.ID)
		if err != nil {
			log.Warnf("Failed to get assignment count for slot %s: %v", slot.ID, err)
			count = 0
		}

		response[i] = InterviewSlotResponse{
			ID:            slot.ID,
			CoursePhaseID: slot.CoursePhaseID,
			StartTime:     pgTimestamptzToTime(slot.StartTime),
			EndTime:       pgTimestamptzToTime(slot.EndTime),
			Location:      pgTextToStringPtr(slot.Location),
			Capacity:      slot.Capacity,
			AssignedCount: count,
			CreatedAt:     slot.CreatedAt.Time,
			UpdatedAt:     slot.UpdatedAt.Time,
		}
	}

	c.JSON(http.StatusOK, response)
}

// getInterviewSlot godoc
// @Summary Get a specific interview slot
// @Description Retrieves details of a specific interview slot
// @Tags interview-slots
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param slotId path string true "Interview Slot UUID"
// @Success 200 {object} InterviewSlotResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [get]
func getInterviewSlot(c *gin.Context) {
	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), slotID)
	if err != nil {
		log.Errorf("Failed to get interview slot: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	count, _ := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), slot.ID)

	response := InterviewSlotResponse{
		ID:            slot.ID,
		CoursePhaseID: slot.CoursePhaseID,
		StartTime:     pgTimestamptzToTime(slot.StartTime),
		EndTime:       pgTimestamptzToTime(slot.EndTime),
		Location:      pgTextToStringPtr(slot.Location),
		Capacity:      slot.Capacity,
		AssignedCount: count,
		CreatedAt:     slot.CreatedAt.Time,
		UpdatedAt:     slot.UpdatedAt.Time,
	}

	c.JSON(http.StatusOK, response)
}

// updateInterviewSlot godoc
// @Summary Update an interview slot
// @Description Updates an existing interview slot
// @Tags interview-slots
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param slotId path string true "Interview Slot UUID"
// @Param request body UpdateInterviewSlotRequest true "Updated slot details"
// @Success 200 {object} db.InterviewSlot
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [put]
func updateInterviewSlot(c *gin.Context) {
	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	var req UpdateInterviewSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.EndTime.Before(req.StartTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	slot, err := InterviewSlotServiceSingleton.queries.UpdateInterviewSlot(context.Background(), db.UpdateInterviewSlotParams{
		ID:        slotID,
		StartTime: timeToPgTimestamptz(req.StartTime),
		EndTime:   timeToPgTimestamptz(req.EndTime),
		Location:  stringPtrToPgText(req.Location),
		Capacity:  req.Capacity,
	})

	if err != nil {
		log.Errorf("Failed to update interview slot: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update interview slot"})
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
// @Router /course_phase/{coursePhaseID}/interview-slots/{slotId} [delete]
func deleteInterviewSlot(c *gin.Context) {
	slotID, err := uuid.Parse(c.Param("slotId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid slot ID"})
		return
	}

	err = InterviewSlotServiceSingleton.queries.DeleteInterviewSlot(context.Background(), slotID)
	if err != nil {
		log.Errorf("Failed to delete interview slot: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete interview slot"})
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
// @Param request body CreateInterviewAssignmentRequest true "Assignment details"
// @Success 201 {object} InterviewAssignmentResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-assignments [post]
func createInterviewAssignment(c *gin.Context) {
	var req CreateInterviewAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get course participation ID from context (set by auth middleware)
	courseParticipationID, exists := c.Get("courseParticipationID")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course participation ID not found"})
		return
	}

	participationUUID, ok := courseParticipationID.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course participation ID"})
		return
	}

	// Check if slot exists and has capacity
	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), req.InterviewSlotID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	count, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), req.InterviewSlotID)
	if err != nil {
		log.Errorf("Failed to count assignments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check slot availability"})
		return
	}

	if count >= int64(slot.Capacity) {
		c.JSON(http.StatusConflict, gin.H{"error": "Interview slot is full"})
		return
	}

	// Check if student already has an assignment
	existingAssignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(context.Background(), participationUUID)
	if err == nil && existingAssignment.ID != uuid.Nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You already have an interview slot assigned"})
		return
	}

	// Create assignment
	assignment, err := InterviewSlotServiceSingleton.queries.CreateInterviewAssignment(context.Background(), db.CreateInterviewAssignmentParams{
		InterviewSlotID:       req.InterviewSlotID,
		CourseParticipationID: participationUUID,
	})

	if err != nil {
		log.Errorf("Failed to create interview assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create interview assignment"})
		return
	}

	response := InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            assignment.AssignedAt.Time,
	}

	c.JSON(http.StatusCreated, response)
}

// getMyInterviewAssignment godoc
// @Summary Get current user's interview assignment
// @Description Retrieves the interview assignment for the current student
// @Tags interview-assignments
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Success 200 {object} InterviewAssignmentResponse
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-assignments/my-assignment [get]
func getMyInterviewAssignment(c *gin.Context) {
	courseParticipationID, exists := c.Get("courseParticipationID")
	if !exists {
		// If no courseParticipationID exists, the user is not a student (likely admin/lecturer)
		// Return 404 as they don't have an assignment
		c.JSON(http.StatusNotFound, gin.H{"error": "No interview assignment found"})
		return
	}

	participationUUID, ok := courseParticipationID.(uuid.UUID)
	if !ok {
		// Try parsing as string if it's not already a UUID
		participationStr, isString := courseParticipationID.(string)
		if !isString {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course participation ID format"})
			return
		}
		var err error
		participationUUID, err = uuid.Parse(participationStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course participation ID"})
			return
		}
	}

	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(context.Background(), participationUUID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No interview assignment found"})
		return
	}

	// Get slot details
	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), assignment.InterviewSlotID)
	if err != nil {
		log.Warnf("Failed to get slot details: %v", err)
	}

	response := InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            assignment.AssignedAt.Time,
	}

	if err == nil {
		count, _ := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), slot.ID)
		response.SlotDetails = &InterviewSlotResponse{
			ID:            slot.ID,
			CoursePhaseID: slot.CoursePhaseID,
			StartTime:     pgTimestamptzToTime(slot.StartTime),
			EndTime:       pgTimestamptzToTime(slot.EndTime),
			Location:      pgTextToStringPtr(slot.Location),
			Capacity:      slot.Capacity,
			AssignedCount: count,
			CreatedAt:     slot.CreatedAt.Time,
			UpdatedAt:     slot.UpdatedAt.Time,
		}
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
// @Router /course_phase/{coursePhaseID}/interview-assignments/{assignmentId} [delete]
func deleteInterviewAssignment(c *gin.Context) {
	assignmentID, err := uuid.Parse(c.Param("assignmentId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	err = InterviewSlotServiceSingleton.queries.DeleteInterviewAssignment(context.Background(), assignmentID)
	if err != nil {
		log.Errorf("Failed to delete interview assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete interview assignment"})
		return
	}

	c.Status(http.StatusNoContent)
}
