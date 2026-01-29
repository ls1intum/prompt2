package interview_slot

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	sdkUtils "github.com/ls1intum/prompt-sdk/utils"
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

type CreateInterviewAssignmentAdminRequest struct {
	InterviewSlotID       uuid.UUID `json:"interview_slot_id" binding:"required"`
	CourseParticipationID uuid.UUID `json:"course_participation_id" binding:"required"`
}

type StudentInfo struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
}

type AssignmentInfo struct {
	ID                    uuid.UUID    `json:"id"`
	CourseParticipationID uuid.UUID    `json:"course_participation_id"`
	AssignedAt            time.Time    `json:"assigned_at"`
	Student               *StudentInfo `json:"student,omitempty"`
}

type InterviewSlotResponse struct {
	ID            uuid.UUID        `json:"id"`
	CoursePhaseID uuid.UUID        `json:"course_phase_id"`
	StartTime     time.Time        `json:"start_time"`
	EndTime       time.Time        `json:"end_time"`
	Location      *string          `json:"location"`
	Capacity      int32            `json:"capacity"`
	AssignedCount int64            `json:"assigned_count"`
	Assignments   []AssignmentInfo `json:"assignments"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
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

	if !req.EndTime.After(req.StartTime) {
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
// @Description Retrieves all interview slots with assignment details
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

	rows, err := InterviewSlotServiceSingleton.queries.GetInterviewSlotWithAssignments(context.Background(), coursePhaseID)
	if err != nil {
		log.Errorf("Failed to get interview slots: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slots"})
		return
	}

	// Get all students for this course phase at once
	// This may fail for non-admin users due to permissions, which is OK - they'll see slots without student names
	studentMap, err := fetchAllStudentsForCoursePhase(c, coursePhaseID)
	if err != nil {
		log.Warnf("Failed to fetch students for course phase (may be due to permissions): %v", err)
		studentMap = make(map[uuid.UUID]*StudentInfo) // Empty map - slots will show without student details
	}

	// Group assignments by slot
	slotMap := make(map[uuid.UUID]*InterviewSlotResponse)
	slotOrder := []uuid.UUID{}

	for _, row := range rows {
		// Check if slot already exists in map
		if _, exists := slotMap[row.SlotID]; !exists {
			// New slot
			slotMap[row.SlotID] = &InterviewSlotResponse{
				ID:            row.SlotID,
				CoursePhaseID: row.CoursePhaseID,
				StartTime:     pgTimestamptzToTime(row.StartTime),
				EndTime:       pgTimestamptzToTime(row.EndTime),
				Location:      pgTextToStringPtr(row.Location),
				Capacity:      row.Capacity,
				Assignments:   []AssignmentInfo{},
				CreatedAt:     pgTimestamptzToTime(row.CreatedAt),
				UpdatedAt:     pgTimestamptzToTime(row.UpdatedAt),
			}
			slotOrder = append(slotOrder, row.SlotID)
		}

		// Add assignment if it exists (assignment_id will be NULL if no assignment)
		if row.AssignmentID.Valid {
			// Convert pgtype.UUID Bytes to google uuid.UUID
			assignmentUUID, err := uuid.FromBytes(row.AssignmentID.Bytes[:])
			if err != nil {
				log.Warnf("Failed to parse assignment UUID: %v", err)
				continue
			}
			participationUUID, err := uuid.FromBytes(row.CourseParticipationID.Bytes[:])
			if err != nil {
				log.Warnf("Failed to parse course participation UUID: %v", err)
				continue
			}

			// Get student info from the map
			student := studentMap[participationUUID]

			assignment := AssignmentInfo{
				ID:                    assignmentUUID,
				CourseParticipationID: participationUUID,
				AssignedAt:            row.AssignedAt.Time,
				Student:               student,
			}
			slotMap[row.SlotID].Assignments = append(slotMap[row.SlotID].Assignments, assignment)
		}
	}

	// Build response array in order
	response := make([]InterviewSlotResponse, 0, len(slotOrder))
	for _, slotID := range slotOrder {
		slot := slotMap[slotID]
		slot.AssignedCount = int64(len(slot.Assignments))
		response = append(response, *slot)
	}

	log.Debugf("Returning %d slots with assignments", len(response))

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

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		} else {
			log.Errorf("Failed to get interview slot: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slot"})
		}
		return
	}

	// Verify slot belongs to this course phase
	if slot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	// Get assignments for this slot
	assignments, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentsBySlot(context.Background(), slotID)
	if err != nil {
		log.Errorf("Failed to get assignments for slot %s: %v", slotID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get assignments"})
		return
	}

	// Get all students for this course phase
	// This may fail for non-admin users due to permissions, which is OK - they'll see assignments without student names
	studentMap, err := fetchAllStudentsForCoursePhase(c, coursePhaseID)
	if err != nil {
		log.Warnf("Failed to fetch students for course phase (may be due to permissions): %v", err)
		studentMap = make(map[uuid.UUID]*StudentInfo) // Empty map - assignments will show without student details
	}

	assignmentInfos := make([]AssignmentInfo, len(assignments))
	for i, assignment := range assignments {
		student := studentMap[assignment.CourseParticipationID]
		assignmentInfos[i] = AssignmentInfo{
			ID:                    assignment.ID,
			CourseParticipationID: assignment.CourseParticipationID,
			AssignedAt:            assignment.AssignedAt.Time,
			Student:               student,
		}
	}

	response := InterviewSlotResponse{
		ID:            slot.ID,
		CoursePhaseID: slot.CoursePhaseID,
		StartTime:     pgTimestamptzToTime(slot.StartTime),
		EndTime:       pgTimestamptzToTime(slot.EndTime),
		Location:      pgTextToStringPtr(slot.Location),
		Capacity:      slot.Capacity,
		AssignedCount: int64(len(assignments)),
		Assignments:   assignmentInfos,
		CreatedAt:     pgTimestamptzToTime(slot.CreatedAt),
		UpdatedAt:     pgTimestamptzToTime(slot.UpdatedAt),
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

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	var req UpdateInterviewSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !req.EndTime.After(req.StartTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	// Verify slot belongs to this course phase before updating
	existingSlot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		} else {
			log.Errorf("Failed to get interview slot: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slot"})
		}
		return
	}

	if existingSlot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	// Validate that new capacity is not less than current assigned count
	currentAssignedCount, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), slotID)
	if err != nil {
		log.Errorf("Failed to count assignments for slot: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to validate capacity"})
		return
	}

	if req.Capacity < int32(currentAssignedCount) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Cannot reduce capacity to %d: slot has %d existing assignments", req.Capacity, currentAssignedCount)})
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

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Verify slot belongs to this course phase before deleting
	existingSlot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		} else {
			log.Errorf("Failed to get interview slot: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slot"})
		}
		return
	}

	if existingSlot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
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

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Use transaction to prevent race condition
	ctx := context.Background()
	tx, err := InterviewSlotServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Errorf("Failed to begin transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process request"})
		return
	}
	defer tx.Rollback(ctx)

	qtx := InterviewSlotServiceSingleton.queries.WithTx(tx)

	// Lock the slot row using FOR UPDATE
	slot, err := qtx.GetInterviewSlotForUpdate(ctx, req.InterviewSlotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		} else {
			log.Errorf("Failed to get interview slot: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slot"})
		}
		return
	}

	// Verify slot belongs to this course phase
	if slot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	// Check capacity within transaction
	count, err := qtx.CountAssignmentsBySlot(ctx, req.InterviewSlotID)
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
	existingAssignment, err := qtx.GetInterviewAssignmentByParticipation(ctx, db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: participationUUID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Errorf("Failed to check existing assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing assignment"})
		return
	}
	if err == nil && existingAssignment.ID != uuid.Nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You already have an interview slot assigned"})
		return
	}

	// Create assignment within transaction
	assignment, err := qtx.CreateInterviewAssignment(ctx, db.CreateInterviewAssignmentParams{
		InterviewSlotID:       req.InterviewSlotID,
		CourseParticipationID: participationUUID,
	})

	if err != nil {
		log.Errorf("Failed to create interview assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create interview assignment"})
		return
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		log.Errorf("Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
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

// createInterviewAssignmentAdmin godoc
// @Summary Manually assign a student to an interview slot (Admin only)
// @Description Allows admins/lecturers to manually assign any student to an interview slot
// @Tags interview-assignments
// @Accept json
// @Produce json
// @Param coursePhaseID path string true "Course Phase UUID"
// @Param request body CreateInterviewAssignmentAdminRequest true "Assignment details with course participation ID"
// @Success 201 {object} InterviewAssignmentResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /course_phase/{coursePhaseID}/interview-assignments/admin [post]
func createInterviewAssignmentAdmin(c *gin.Context) {
	var req CreateInterviewAssignmentAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Use transaction to prevent race condition
	ctx := context.Background()
	tx, err := InterviewSlotServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Errorf("Failed to begin transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process request"})
		return
	}
	defer tx.Rollback(ctx)

	qtx := InterviewSlotServiceSingleton.queries.WithTx(tx)

	// Lock the slot row using FOR UPDATE
	slot, err := qtx.GetInterviewSlotForUpdate(ctx, req.InterviewSlotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		} else {
			log.Errorf("Failed to get interview slot: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview slot"})
		}
		return
	}

	// Verify slot belongs to this course phase
	if slot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	// Check capacity within transaction
	count, err := qtx.CountAssignmentsBySlot(ctx, req.InterviewSlotID)
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
	existingAssignment, err := qtx.GetInterviewAssignmentByParticipation(ctx, db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Errorf("Failed to check existing assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing assignment"})
		return
	}
	if err == nil && existingAssignment.ID != uuid.Nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Student already has an interview slot assigned"})
		return
	}

	// Create assignment within transaction
	assignment, err := qtx.CreateInterviewAssignment(ctx, db.CreateInterviewAssignmentParams{
		InterviewSlotID:       req.InterviewSlotID,
		CourseParticipationID: req.CourseParticipationID,
	})

	if err != nil {
		log.Errorf("Failed to create interview assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create interview assignment"})
		return
	}

	// Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		log.Errorf("Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
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
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Fetch the user's own course participation ID from core service
	coreURL := sdkUtils.GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s/participations/self", coreURL, coursePhaseID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Errorf("Failed to create request for self participation: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participation"})
		return
	}

	// Forward the authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Errorf("Failed to fetch self participation: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch participation"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		c.JSON(http.StatusNotFound, gin.H{"error": "No course participation found for user"})
		return
	}

	if resp.StatusCode != http.StatusOK {
		log.Errorf("Core service returned status %d for self participation", resp.StatusCode)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch participation"})
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Errorf("Failed to read self participation response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read participation"})
		return
	}

	var selfParticipation struct {
		CourseParticipationID uuid.UUID `json:"courseParticipationID"`
	}

	if err := json.Unmarshal(body, &selfParticipation); err != nil {
		log.Errorf("Failed to unmarshal self participation: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse participation"})
		return
	}

	participationUUID := selfParticipation.CourseParticipationID
	log.Debugf("Found participation UUID %s for course phase %s", participationUUID, coursePhaseID)

	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(context.Background(), db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: participationUUID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "No interview assignment found"})
		} else {
			log.Errorf("Failed to get interview assignment: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview assignment"})
		}
		return
	}

	// Get slot details
	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), assignment.InterviewSlotID)
	if err != nil {
		log.Errorf("Failed to get slot details: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get slot details"})
		return
	}

	// Count assignments for the slot
	count, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(context.Background(), slot.ID)
	if err != nil {
		log.Errorf("Failed to count assignments for slot: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count assignments"})
		return
	}

	response := InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            assignment.AssignedAt.Time,
		SlotDetails: &InterviewSlotResponse{
			ID:            slot.ID,
			CoursePhaseID: slot.CoursePhaseID,
			StartTime:     pgTimestamptzToTime(slot.StartTime),
			EndTime:       pgTimestamptzToTime(slot.EndTime),
			Location:      pgTextToStringPtr(slot.Location),
			Capacity:      slot.Capacity,
			AssignedCount: count,
			CreatedAt:     pgTimestamptzToTime(slot.CreatedAt),
			UpdatedAt:     pgTimestamptzToTime(slot.UpdatedAt),
		},
	}

	c.JSON(http.StatusOK, response)
}

// fetchAllStudentsForCoursePhase fetches all students for a course phase from the core service
// and returns a map of course participation ID to student info
func fetchAllStudentsForCoursePhase(c *gin.Context, coursePhaseID uuid.UUID) (map[uuid.UUID]*StudentInfo, error) {
	coreURL := sdkUtils.GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s/participations", coreURL, coursePhaseID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for course phase participations: %w", err)
	}

	// Forward the authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch course phase participations: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("core service returned status %d for course phase participations", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read course phase participations response: %w", err)
	}

	var participationsResponse struct {
		Participations []struct {
			CourseParticipationID uuid.UUID   `json:"courseParticipationID"`
			Student               StudentInfo `json:"student"`
		} `json:"participations"`
	}

	if err := json.Unmarshal(body, &participationsResponse); err != nil {
		return nil, fmt.Errorf("failed to unmarshal course phase participations: %w", err)
	}

	// Build map of course participation ID to student info
	studentMap := make(map[uuid.UUID]*StudentInfo)
	for _, participation := range participationsResponse.Participations {
		studentCopy := participation.Student
		studentMap[participation.CourseParticipationID] = &studentCopy
	}

	return studentMap, nil
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

	// Get the assignment first to verify ownership
	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignment(context.Background(), assignmentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		} else {
			log.Errorf("Failed to get interview assignment: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview assignment"})
		}
		return
	}

	// Check user roles for authorization
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

	// Check if user has privileged role (can delete any assignment)
	isPrivileged := false
	privilegedRoles := []string{promptSDK.PromptAdmin, promptSDK.PromptLecturer, promptSDK.CourseLecturer, promptSDK.CourseEditor}
	for _, role := range roles {
		for _, privileged := range privilegedRoles {
			if role == privileged {
				isPrivileged = true
				break
			}
		}
		if isPrivileged {
			break
		}
	}

	// If not privileged, verify ownership
	if !isPrivileged {
		// Get user ID from context to find their course participation
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found"})
			return
		}

		userIDStr, ok := userID.(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}

		// Fetch course participation to verify ownership
		coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
			return
		}
		studentMap, err := fetchAllStudentsForCoursePhase(c, coursePhaseID)
		if err != nil {
			log.Errorf("Failed to fetch students for course phase: %v", err)
			c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch student information"})
			return
		}

		// Find the user's course participation ID
		var userParticipationID uuid.UUID
		for participationID, student := range studentMap {
			if student != nil && student.ID.String() == userIDStr {
				userParticipationID = participationID
				break
			}
		}

		if userParticipationID == uuid.Nil || assignment.CourseParticipationID != userParticipationID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete another user's assignment"})
			return
		}
	}

	err = InterviewSlotServiceSingleton.queries.DeleteInterviewAssignment(context.Background(), assignmentID)
	if err != nil {
		log.Errorf("Failed to delete interview assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete interview assignment"})
		return
	}

	c.Status(http.StatusNoContent)
}
