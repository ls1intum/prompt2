package allocations

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/team_allocation/coreRequests"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/tease/teaseDTO"
	"github.com/ls1intum/prompt2/servers/team_allocation/utils"
	log "github.com/sirupsen/logrus"
)

type AllocationsService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var AllocationsServiceSingleton *AllocationsService

func GetTeamAllocationCoursePhases(
	ctx context.Context,
	authHeader string,
	userPermissions map[string]bool,
) ([]teaseDTO.TeasePhase, error) {
	// 1. Request from core to get all relevant courses
	coreURL := utils.GetCoreUrl()
	courses, err := coreRequests.GetCourses(coreURL, authHeader)
	if err != nil {
		log.Error("could not get courses from core: ", err)
		return nil, err
	}

	// 2. Filter for the courses with a "Team Allocation" course phase and the user has permission
	type RelevantCoursePhase struct {
		CoursePhaseID uuid.UUID
		CourseID      uuid.UUID
		SemesterName  string
	}

	var relevantCoursePhases []RelevantCoursePhase
	for _, course := range courses {
		for _, coursePhase := range course.CoursePhases {
			if coursePhase.CoursePhaseType == "Team Allocation" &&
				hasCoursePhasePermission(userPermissions, course.SemesterTag, course.Name) {

				relevantCoursePhases = append(relevantCoursePhases, RelevantCoursePhase{
					CoursePhaseID: coursePhase.ID,
					CourseID:      coursePhase.CourseID,
					SemesterName:  fmt.Sprintf("%s-%s-%s", course.SemesterTag, course.Name, coursePhase.Name),
				})
			}
		}
	}

	// 3. For each of these course phases, get the survey deadline
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	teasePhases := make([]teaseDTO.TeasePhase, 0, len(relevantCoursePhases))
	for _, coursePhase := range relevantCoursePhases {
		deadline, err := AllocationsServiceSingleton.queries.GetSurveyDeadline(ctxWithTimeout, coursePhase.CoursePhaseID)
		if err != nil {
			// Allow missing deadlines but fail for other errors
			if errors.Is(err, sql.ErrNoRows) {
				log.WithFields(log.Fields{
					"course_phase_id": coursePhase.CoursePhaseID,
				}).Warn("no survey deadline found for this course phase, continuing anyway")
			} else {
				log.Error("failed to get survey deadline for course phase: ", err)
				return nil, err
			}
		}

		teasePhases = append(teasePhases, teaseDTO.TeasePhase{
			CoursePhaseID:              coursePhase.CoursePhaseID,
			SemesterName:               coursePhase.SemesterName,
			KickoffSubmissionPeriodEnd: deadline,
		})
	}

	// 4. Return these course phases with names
	return teasePhases, nil
}

func hasCoursePhasePermission(userPermissions map[string]bool, semesterTag, courseName string) bool {
	// Admins always have permission
	if userPermissions[promptSDK.PromptAdmin] {
		return true
	}

	// Otherwise, check for lecturer-specific permission
	requiredPermission := fmt.Sprintf("%s-%s-%s", semesterTag, courseName, promptSDK.CourseLecturer)
	return userPermissions[requiredPermission]
}

func GetAllocationsByCoursePhase(ctx context.Context, coursePhaseID uuid.UUID) ([]db.Allocation, error) {
	dbAllocations, err := AllocationsServiceSingleton.queries.GetAllocationsByCoursePhase(ctx, coursePhaseID)
	if err != nil {
		log.Error("could not get the allocations from the database: ", err)
		return nil, fmt.Errorf("could not get the allocations from the database: %w", err)
	}
	return dbAllocations, nil
}

func GetStudentAllocation(ctx context.Context, courseParticipationID uuid.UUID, coursePhaseID uuid.UUID) (db.Allocation, error) {

	arg := db.GetAllocationForStudentParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	}

	dbAllocation, err := AllocationsServiceSingleton.queries.GetAllocationForStudent(ctx, arg)
	if err != nil {
		log.Error("could not get the allocation from the database: ", err)
		return db.Allocation{}, fmt.Errorf("could not get the allocation from the database: %w", err)
	}
	return dbAllocation, nil
}

func PutAllocation(ctx context.Context, courseParticipationID uuid.UUID, teamID uuid.UUID, coursePhaseID uuid.UUID) error {
	tx, err := AllocationsServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer promptSDK.DeferDBRollback(tx, ctx)
	qtx := AllocationsServiceSingleton.queries.WithTx(tx)

	arg := db.GetAllocationForStudentParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	}
	existingAllocation, err := qtx.GetAllocationForStudent(ctx, arg)
	if err == nil {
		updateArg := db.UpdateAllocationParams{
			ID:            existingAllocation.ID,
			CoursePhaseID: coursePhaseID,
			TeamID:        teamID,
		}
		err = qtx.UpdateAllocation(ctx, updateArg)
		if err != nil {
			log.Error("could not update the allocation in the database: ", err)
			return errors.New("could not update the allocation in the database")
		}
	} else if !errors.Is(err, sql.ErrNoRows) {
		log.Error("error checking for existing allocation: ", err)
		return errors.New("could not check for existing allocation")
	} else {
		err = qtx.CreateAllocation(ctx, db.CreateAllocationParams{
			ID:                    uuid.New(),
			CourseParticipationID: courseParticipationID,
			TeamID:                teamID,
			CoursePhaseID:         coursePhaseID,
		})
		if err != nil {
			log.Error("could not create the allocation in the database: ", err)
			return errors.New("could not create the allocation in the database")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
