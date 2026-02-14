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

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	sdkUtils "github.com/ls1intum/prompt-sdk/utils"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
	interviewSlotDTO "github.com/ls1intum/prompt2/servers/interview/interview_slot/interviewSlotDTO"
	log "github.com/sirupsen/logrus"
)

type InterviewSlotService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var InterviewSlotServiceSingleton *InterviewSlotService

type ServiceError struct {
	StatusCode int
	Message    string
	Err        error
}

func (e *ServiceError) Error() string {
	return e.Message
}

func (e *ServiceError) Unwrap() error {
	return e.Err
}

func newServiceError(statusCode int, message string, err error) *ServiceError {
	return &ServiceError{StatusCode: statusCode, Message: message, Err: err}
}

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

func CreateInterviewSlot(ctx context.Context, coursePhaseID uuid.UUID, req interviewSlotDTO.CreateInterviewSlotRequest) (db.InterviewSlot, error) {
	if !req.EndTime.After(req.StartTime) {
		return db.InterviewSlot{}, newServiceError(http.StatusBadRequest, "End time must be after start time", nil)
	}

	slot, err := InterviewSlotServiceSingleton.queries.CreateInterviewSlot(ctx, db.CreateInterviewSlotParams{
		CoursePhaseID: coursePhaseID,
		StartTime:     timeToPgTimestamptz(req.StartTime),
		EndTime:       timeToPgTimestamptz(req.EndTime),
		Location:      stringPtrToPgText(req.Location),
		Capacity:      req.Capacity,
	})
	if err != nil {
		log.Errorf("Failed to create interview slot: %v", err)
		return db.InterviewSlot{}, newServiceError(http.StatusInternalServerError, "Failed to create interview slot", err)
	}

	return slot, nil
}

func GetAllInterviewSlots(ctx context.Context, coursePhaseID uuid.UUID, authHeader string) ([]interviewSlotDTO.InterviewSlotResponse, error) {
	rows, err := InterviewSlotServiceSingleton.queries.GetInterviewSlotWithAssignments(ctx, coursePhaseID)
	if err != nil {
		log.Errorf("Failed to get interview slots: %v", err)
		return nil, newServiceError(http.StatusInternalServerError, "Failed to get interview slots", err)
	}

	studentMap, err := fetchAllStudentsForCoursePhase(ctx, coursePhaseID, authHeader)
	if err != nil {
		log.Warnf("Failed to fetch students for course phase (may be due to permissions): %v", err)
		studentMap = make(map[uuid.UUID]*interviewSlotDTO.StudentInfo)
	}

	slotMap := make(map[uuid.UUID]*interviewSlotDTO.InterviewSlotResponse)
	slotOrder := []uuid.UUID{}

	for _, row := range rows {
		if _, exists := slotMap[row.SlotID]; !exists {
			slotMap[row.SlotID] = &interviewSlotDTO.InterviewSlotResponse{
				ID:            row.SlotID,
				CoursePhaseID: row.CoursePhaseID,
				StartTime:     pgTimestamptzToTime(row.StartTime),
				EndTime:       pgTimestamptzToTime(row.EndTime),
				Location:      pgTextToStringPtr(row.Location),
				Capacity:      row.Capacity,
				Assignments:   []interviewSlotDTO.AssignmentInfo{},
				CreatedAt:     pgTimestamptzToTime(row.CreatedAt),
				UpdatedAt:     pgTimestamptzToTime(row.UpdatedAt),
			}
			slotOrder = append(slotOrder, row.SlotID)
		}

		if row.AssignmentID.Valid {
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

			assignment := interviewSlotDTO.AssignmentInfo{
				ID:                    assignmentUUID,
				CourseParticipationID: participationUUID,
				AssignedAt:            pgTimestamptzToTime(row.AssignedAt),
				Student:               studentMap[participationUUID],
			}
			slotMap[row.SlotID].Assignments = append(slotMap[row.SlotID].Assignments, assignment)
		}
	}

	response := make([]interviewSlotDTO.InterviewSlotResponse, 0, len(slotOrder))
	for _, slotID := range slotOrder {
		slot := slotMap[slotID]
		slot.AssignedCount = int64(len(slot.Assignments))
		response = append(response, *slot)
	}

	return response, nil
}

func GetInterviewSlot(ctx context.Context, coursePhaseID uuid.UUID, slotID uuid.UUID, authHeader string) (interviewSlotDTO.InterviewSlotResponse, error) {
	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(ctx, slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return interviewSlotDTO.InterviewSlotResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return interviewSlotDTO.InterviewSlotResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if slot.CoursePhaseID != coursePhaseID {
		return interviewSlotDTO.InterviewSlotResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", nil)
	}

	assignments, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentsBySlot(ctx, slotID)
	if err != nil {
		log.Errorf("Failed to get assignments for slot %s: %v", slotID, err)
		return interviewSlotDTO.InterviewSlotResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get assignments", err)
	}

	studentMap, err := fetchAllStudentsForCoursePhase(ctx, coursePhaseID, authHeader)
	if err != nil {
		log.Warnf("Failed to fetch students for course phase (may be due to permissions): %v", err)
		studentMap = make(map[uuid.UUID]*interviewSlotDTO.StudentInfo)
	}

	assignmentInfos := make([]interviewSlotDTO.AssignmentInfo, len(assignments))
	for i, assignment := range assignments {
		assignmentInfos[i] = interviewSlotDTO.AssignmentInfo{
			ID:                    assignment.ID,
			CourseParticipationID: assignment.CourseParticipationID,
			AssignedAt:            pgTimestamptzToTime(assignment.AssignedAt),
			Student:               studentMap[assignment.CourseParticipationID],
		}
	}

	response := interviewSlotDTO.InterviewSlotResponse{
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

	return response, nil
}

func UpdateInterviewSlot(ctx context.Context, coursePhaseID uuid.UUID, slotID uuid.UUID, req interviewSlotDTO.UpdateInterviewSlotRequest) (db.InterviewSlot, error) {
	if !req.EndTime.After(req.StartTime) {
		return db.InterviewSlot{}, newServiceError(http.StatusBadRequest, "End time must be after start time", nil)
	}

	existingSlot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(ctx, slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return db.InterviewSlot{}, newServiceError(http.StatusNotFound, "Interview slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return db.InterviewSlot{}, newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if existingSlot.CoursePhaseID != coursePhaseID {
		return db.InterviewSlot{}, newServiceError(http.StatusNotFound, "Interview slot not found", nil)
	}

	currentAssignedCount, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(ctx, slotID)
	if err != nil {
		log.Errorf("Failed to count assignments for slot: %v", err)
		return db.InterviewSlot{}, newServiceError(http.StatusInternalServerError, "Failed to validate capacity", err)
	}

	if req.Capacity < int32(currentAssignedCount) {
		return db.InterviewSlot{}, newServiceError(
			http.StatusBadRequest,
			fmt.Sprintf("Cannot reduce capacity to %d: slot has %d existing assignments", req.Capacity, currentAssignedCount),
			nil,
		)
	}

	slot, err := InterviewSlotServiceSingleton.queries.UpdateInterviewSlot(ctx, db.UpdateInterviewSlotParams{
		ID:        slotID,
		StartTime: timeToPgTimestamptz(req.StartTime),
		EndTime:   timeToPgTimestamptz(req.EndTime),
		Location:  stringPtrToPgText(req.Location),
		Capacity:  req.Capacity,
	})
	if err != nil {
		log.Errorf("Failed to update interview slot: %v", err)
		return db.InterviewSlot{}, newServiceError(http.StatusInternalServerError, "Failed to update interview slot", err)
	}

	return slot, nil
}

func DeleteInterviewSlot(ctx context.Context, coursePhaseID uuid.UUID, slotID uuid.UUID) error {
	existingSlot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(ctx, slotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return newServiceError(http.StatusNotFound, "Interview slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if existingSlot.CoursePhaseID != coursePhaseID {
		return newServiceError(http.StatusNotFound, "Interview slot not found", nil)
	}

	if err := InterviewSlotServiceSingleton.queries.DeleteInterviewSlot(ctx, slotID); err != nil {
		log.Errorf("Failed to delete interview slot: %v", err)
		return newServiceError(http.StatusInternalServerError, "Failed to delete interview slot", err)
	}

	return nil
}

func CreateInterviewAssignment(ctx context.Context, coursePhaseID uuid.UUID, participationUUID uuid.UUID, req interviewSlotDTO.CreateInterviewAssignmentRequest) (interviewSlotDTO.InterviewAssignmentResponse, error) {
	if participationUUID == uuid.Nil {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusBadRequest, "Invalid course participation ID", nil)
	}

	tx, err := InterviewSlotServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Errorf("Failed to begin transaction: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to process request", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	qtx := InterviewSlotServiceSingleton.queries.WithTx(tx)

	slot, err := qtx.GetInterviewSlotForUpdate(ctx, req.InterviewSlotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if slot.CoursePhaseID != coursePhaseID {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", nil)
	}

	count, err := qtx.CountAssignmentsBySlot(ctx, req.InterviewSlotID)
	if err != nil {
		log.Errorf("Failed to count assignments: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to check slot availability", err)
	}
	if count >= int64(slot.Capacity) {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusConflict, "Interview slot is full", nil)
	}

	existingAssignment, err := qtx.GetInterviewAssignmentByParticipation(ctx, db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: participationUUID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Errorf("Failed to check existing assignment: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to check existing assignment", err)
	}
	if err == nil && existingAssignment.ID != uuid.Nil {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusConflict, "You already have an interview slot assigned", nil)
	}

	assignment, err := qtx.CreateInterviewAssignment(ctx, db.CreateInterviewAssignmentParams{
		InterviewSlotID:       req.InterviewSlotID,
		CourseParticipationID: participationUUID,
	})
	if err != nil {
		log.Errorf("Failed to create interview assignment: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to create interview assignment", err)
	}

	if err := tx.Commit(ctx); err != nil {
		log.Errorf("Failed to commit transaction: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to create assignment", err)
	}

	return interviewSlotDTO.InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            pgTimestamptzToTime(assignment.AssignedAt),
	}, nil
}

func CreateInterviewAssignmentAdmin(ctx context.Context, coursePhaseID uuid.UUID, req interviewSlotDTO.CreateInterviewAssignmentAdminRequest) (interviewSlotDTO.InterviewAssignmentResponse, error) {
	if req.CourseParticipationID == uuid.Nil {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusBadRequest, "Invalid course participation ID", nil)
	}

	tx, err := InterviewSlotServiceSingleton.conn.Begin(ctx)
	if err != nil {
		log.Errorf("Failed to begin transaction: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to process request", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	qtx := InterviewSlotServiceSingleton.queries.WithTx(tx)

	slot, err := qtx.GetInterviewSlotForUpdate(ctx, req.InterviewSlotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if slot.CoursePhaseID != coursePhaseID {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusNotFound, "Interview slot not found", nil)
	}

	count, err := qtx.CountAssignmentsBySlot(ctx, req.InterviewSlotID)
	if err != nil {
		log.Errorf("Failed to count assignments: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to check slot availability", err)
	}
	if count >= int64(slot.Capacity) {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusConflict, "Interview slot is full", nil)
	}

	existingAssignment, err := qtx.GetInterviewAssignmentByParticipation(ctx, db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: req.CourseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.Errorf("Failed to check existing assignment: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to check existing assignment", err)
	}
	if err == nil && existingAssignment.ID != uuid.Nil {
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusConflict, "Student already has an interview slot assigned", nil)
	}

	assignment, err := qtx.CreateInterviewAssignment(ctx, db.CreateInterviewAssignmentParams{
		InterviewSlotID:       req.InterviewSlotID,
		CourseParticipationID: req.CourseParticipationID,
	})
	if err != nil {
		log.Errorf("Failed to create interview assignment: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to create interview assignment", err)
	}

	if err := tx.Commit(ctx); err != nil {
		log.Errorf("Failed to commit transaction: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to create assignment", err)
	}

	return interviewSlotDTO.InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            pgTimestamptzToTime(assignment.AssignedAt),
	}, nil
}

func GetMyInterviewAssignment(ctx context.Context, coursePhaseID uuid.UUID, authHeader string) (interviewSlotDTO.InterviewAssignmentResponse, error) {
	participationUUID, statusCode, errorMessage, err := fetchSelfParticipationID(ctx, coursePhaseID, authHeader)
	if err != nil {
		log.Errorf("Failed to fetch self participation: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(statusCode, errorMessage, err)
	}

	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignmentByParticipation(ctx, db.GetInterviewAssignmentByParticipationParams{
		CourseParticipationID: participationUUID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusNotFound, "No interview assignment found", err)
		}
		log.Errorf("Failed to get interview assignment: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get interview assignment", err)
	}

	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(ctx, assignment.InterviewSlotID)
	if err != nil {
		log.Errorf("Failed to get slot details: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to get slot details", err)
	}

	count, err := InterviewSlotServiceSingleton.queries.CountAssignmentsBySlot(ctx, slot.ID)
	if err != nil {
		log.Errorf("Failed to count assignments for slot: %v", err)
		return interviewSlotDTO.InterviewAssignmentResponse{}, newServiceError(http.StatusInternalServerError, "Failed to count assignments", err)
	}

	return interviewSlotDTO.InterviewAssignmentResponse{
		ID:                    assignment.ID,
		InterviewSlotID:       assignment.InterviewSlotID,
		CourseParticipationID: assignment.CourseParticipationID,
		AssignedAt:            pgTimestamptzToTime(assignment.AssignedAt),
		SlotDetails: &interviewSlotDTO.InterviewSlotResponse{
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
	}, nil
}

func DeleteInterviewAssignment(ctx context.Context, coursePhaseID uuid.UUID, assignmentID uuid.UUID, authHeader string, roles []string) error {
	assignment, err := InterviewSlotServiceSingleton.queries.GetInterviewAssignment(ctx, assignmentID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return newServiceError(http.StatusNotFound, "Assignment not found", err)
		}
		log.Errorf("Failed to get interview assignment: %v", err)
		return newServiceError(http.StatusInternalServerError, "Failed to get interview assignment", err)
	}

	slot, err := InterviewSlotServiceSingleton.queries.GetInterviewSlot(ctx, assignment.InterviewSlotID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return newServiceError(http.StatusNotFound, "Slot not found", err)
		}
		log.Errorf("Failed to get interview slot: %v", err)
		return newServiceError(http.StatusInternalServerError, "Failed to get interview slot", err)
	}

	if slot.CoursePhaseID != coursePhaseID {
		return newServiceError(http.StatusForbidden, "Assignment does not belong to the specified course phase", nil)
	}

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

	if !isPrivileged {
		selfParticipationID, statusCode, _, err := fetchSelfParticipationID(ctx, coursePhaseID, authHeader)
		if err != nil {
			if statusCode == http.StatusNotFound {
				return newServiceError(http.StatusForbidden, "Cannot delete another user's assignment", err)
			}
			log.Errorf("Failed to fetch self participation for ownership check: %v", err)
			return newServiceError(http.StatusBadGateway, "Failed to verify ownership", err)
		}

		if assignment.CourseParticipationID != selfParticipationID {
			return newServiceError(http.StatusForbidden, "Cannot delete another user's assignment", nil)
		}
	}

	if err := InterviewSlotServiceSingleton.queries.DeleteInterviewAssignment(ctx, assignmentID); err != nil {
		log.Errorf("Failed to delete interview assignment: %v", err)
		return newServiceError(http.StatusInternalServerError, "Failed to delete interview assignment", err)
	}

	return nil
}

func fetchSelfParticipationID(ctx context.Context, coursePhaseID uuid.UUID, authHeader string) (uuid.UUID, int, string, error) {
	coreURL := sdkUtils.GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s/participations/self", coreURL, coursePhaseID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return uuid.Nil, http.StatusInternalServerError, "Failed to fetch participation", fmt.Errorf("failed to create request for self participation: %w", err)
	}

	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return uuid.Nil, http.StatusBadGateway, "Failed to fetch participation", fmt.Errorf("failed to fetch self participation: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode == http.StatusNotFound {
		return uuid.Nil, http.StatusNotFound, "No course participation found for user", errors.New("no course participation found for user")
	}
	if resp.StatusCode != http.StatusOK {
		return uuid.Nil, http.StatusBadGateway, "Failed to fetch participation", fmt.Errorf("core service returned status %d for self participation", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return uuid.Nil, http.StatusInternalServerError, "Failed to read participation", fmt.Errorf("failed to read self participation response: %w", err)
	}

	var selfParticipation interviewSlotDTO.SelfParticipationResponse
	if err := json.Unmarshal(body, &selfParticipation); err != nil {
		return uuid.Nil, http.StatusInternalServerError, "Failed to parse participation", fmt.Errorf("failed to unmarshal self participation response: %w", err)
	}

	if selfParticipation.CourseParticipationID == uuid.Nil {
		return uuid.Nil, http.StatusNotFound, "No course participation found for user", errors.New("self participation ID is empty")
	}

	return selfParticipation.CourseParticipationID, http.StatusOK, "", nil
}

func fetchAllStudentsForCoursePhase(ctx context.Context, coursePhaseID uuid.UUID, authHeader string) (map[uuid.UUID]*interviewSlotDTO.StudentInfo, error) {
	coreURL := sdkUtils.GetCoreUrl()
	url := fmt.Sprintf("%s/api/course_phases/%s/participations", coreURL, coursePhaseID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for course phase participations: %w", err)
	}

	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch course phase participations: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("core service returned status %d for course phase participations", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read course phase participations response: %w", err)
	}

	var participationsResponse struct {
		Participations []struct {
			CourseParticipationID uuid.UUID                    `json:"courseParticipationID"`
			Student               interviewSlotDTO.StudentInfo `json:"student"`
		} `json:"participations"`
	}

	if err := json.Unmarshal(body, &participationsResponse); err != nil {
		return nil, fmt.Errorf("failed to unmarshal course phase participations: %w", err)
	}

	studentMap := make(map[uuid.UUID]*interviewSlotDTO.StudentInfo)
	for _, participation := range participationsResponse.Participations {
		studentCopy := participation.Student
		studentMap[participation.CourseParticipationID] = &studentCopy
	}

	return studentMap, nil
}
