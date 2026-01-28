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
	studentMap := fetchAllStudentsForCoursePhase(c, coursePhaseID)

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
				CreatedAt:     row.CreatedAt.Time,
				UpdatedAt:     row.UpdatedAt.Time,
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

	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(context.Background(), slotID)
	if err != nil {
		log.Errorf("Failed to get interview slot: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	// Get assignments for this slot
	assignments, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentsBySlot(context.Background(), slotID)
	if err != nil {
		log.Warnf("Failed to get assignments for slot %s: %v", slotID, err)
		assignments = []db.InterviewAssignment{}
	}

	// Get all students for this course phase
	coursePhaseID, _ := uuid.Parse(c.Param("coursePhaseID"))
	studentMap := fetchAllStudentsForCoursePhase(c, coursePhaseID)

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
	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	// Verify slot belongs to this course phase
	if slot.CoursePhaseID != coursePhaseID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Interview slot not found"})
		return
	}

	existingAssignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(context.Background(), db.GetInterviewAssignmentByParticipationParams{
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

	coursePhaseID, err := uuid.Parse(c.Param("coursePhaseID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course phase ID"})
		return
	}

	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(context.Background(), db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: participationUUID,
		CoursePhaseID:         coursePhaseID,
	})
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
			CreatedAt:     pgTimestamptzToTime(slot.CreatedAt),
			UpdatedAt:     pgTimestamptzToTime(slot.UpdatedAt),
		}
	}

	c.JSON(http.StatusOK, response)
}

// fetchAllStudentsForCoursePhase fetches all students for a course phase from the core service
// and returns a map of course participation ID to student info
func fetchAllStudentsForCoursePhase(c *gin.Context, coursePhaseID uuid.UUID) map[uuid.UUID]*StudentInfo {
	coreURL := sdkUtils.GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s/participations", coreURL, coursePhaseID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Warnf("Failed to create request for course phase participations: %v", err)
		return make(map[uuid.UUID]*StudentInfo)
	}

	// Forward the authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Warnf("Failed to fetch course phase participations: %v", err)
		return make(map[uuid.UUID]*StudentInfo)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Warnf("Core service returned status %d for course phase participations", resp.StatusCode)
		return make(map[uuid.UUID]*StudentInfo)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Warnf("Failed to read course phase participations response: %v", err)
		return make(map[uuid.UUID]*StudentInfo)
	}

	var participationsResponse struct {
		Participations []struct {
			CourseParticipationID uuid.UUID   `json:"courseParticipationID"`
			Student               StudentInfo `json:"student"`
		} `json:"participations"`
	}

	if err := json.Unmarshal(body, &participationsResponse); err != nil {
		log.Warnf("Failed to unmarshal course phase participations: %v", err)
		return make(map[uuid.UUID]*StudentInfo)
	}

	// Build map of course participation ID to student info
	studentMap := make(map[uuid.UUID]*StudentInfo)
	for _, participation := range participationsResponse.Participations {
		studentCopy := participation.Student
		studentMap[participation.CourseParticipationID] = &studentCopy
	}

	return studentMap
}

// fetchStudentInfo fetches student information for a specific course participation ID
func fetchStudentInfo(c *gin.Context, courseParticipationID uuid.UUID) *StudentInfo {
	// This function is kept for compatibility but should be replaced with fetchAllStudentsForCoursePhase
	// for better performance when fetching multiple students
	log.Warn("fetchStudentInfo called for single student - consider using fetchAllStudentsForCoursePhase for batch fetching")
	return nil
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

	// Verify the user owns this assignment (unless admin/lecturer)
	courseParticipationID, exists := c.Get("courseParticipationID")
	if exists {
		participationUUID, ok := courseParticipationID.(uuid.UUID)
		if !ok {
			// Try parsing as string
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
		if assignment.CourseParticipationID != participationUUID {
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
