package course

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CourseService struct {
	queries db.Queries
	conn    *pgx.Conn
	// use dependency injection for keycloak to allow mocking
	createCourseGroupsAndRoles func(ctx context.Context, courseName, iterationName string) error
	addUserToGroup             func(ctx context.Context, userID, groupName string) error
}

var CourseServiceSingleton *CourseService

func GetAllCourses(ctx context.Context) ([]courseDTO.CourseWithPhases, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	courses, err := CourseServiceSingleton.queries.GetAllActiveCourses(ctxWithTimeout)
	if err != nil {
		return nil, err
	}

	// TODO rewrite this cleaner!!!
	dtoCourses := make([]courseDTO.CourseWithPhases, 0, len(courses))
	for _, course := range courses {
		dtoCourse, err := GetCourseByID(ctxWithTimeout, course.ID)
		if err != nil {
			return nil, err
		}
		dtoCourses = append(dtoCourses, dtoCourse)
	}
	return dtoCourses, nil
}

func GetCourseByID(ctx context.Context, id uuid.UUID) (courseDTO.CourseWithPhases, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()
	// TODO: replace with query to get the course incl phases
	course, err := CourseServiceSingleton.queries.GetCourse(ctxWithTimeout, id)
	if err != nil {
		return courseDTO.CourseWithPhases{}, err
	}

	// Get all course phases in order
	coursePhasesOrder, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(ctx, id)
	if err != nil {
		return courseDTO.CourseWithPhases{}, err
	}

	// get all coursePhases out of order
	coursePhasesNoOrder, err := CourseServiceSingleton.queries.GetNotOrderedCoursePhases(ctx, id)
	if err != nil {
		return courseDTO.CourseWithPhases{}, err
	}

	coursePhaseDTO, err := coursePhaseDTO.GetCoursePhaseSequenceDTO(coursePhasesOrder, coursePhasesNoOrder)
	if err != nil {
		return courseDTO.CourseWithPhases{}, err

	}

	CourseWithPhases, err := courseDTO.GetCourseByIDFromDBModel(course)
	if err != nil {
		return courseDTO.CourseWithPhases{}, err
	}

	CourseWithPhases.CoursePhases = coursePhaseDTO

	return CourseWithPhases, nil
}

func CreateCourse(ctx context.Context, course courseDTO.CreateCourse, requesterID string) (courseDTO.Course, error) {
	// start transaction to roll back if keycloak failed
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return courseDTO.Course{}, err
	}
	defer tx.Rollback(ctx)

	createCourseParams, err := course.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, err
	}

	createCourseParams.ID = uuid.New()
	createdCourse, err := CourseServiceSingleton.queries.CreateCourse(ctx, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, err
	}

	// create keycloak roles
	err = CourseServiceSingleton.createCourseGroupsAndRoles(ctx, createdCourse.Name, createdCourse.SemesterTag.String)
	if err != nil {
		log.Error("Failed to create keycloak roles for course: ", err)
		return courseDTO.Course{}, err
	}

	roleString := fmt.Sprintf("%s-%s-Lecturer", createdCourse.Name, createdCourse.SemesterTag.String)
	err = CourseServiceSingleton.addUserToGroup(ctx, requesterID, roleString)
	if err != nil {
		log.Error("Failed to assign requestor to lecturer roles for course: ", err)
		return courseDTO.Course{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return courseDTO.GetCourseDTOFromDBModel(createdCourse)
}

func UpdateCoursePhaseOrder(ctx context.Context, courseID uuid.UUID, updatedPhaseOrder courseDTO.CoursePhaseOrderRequest) error {
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// delete all previous connections
	err = CourseServiceSingleton.queries.DeleteCourseGraph(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for i := range updatedPhaseOrder.OrderedPhases {
		if i < len(updatedPhaseOrder.OrderedPhases)-1 {
			err = CourseServiceSingleton.queries.CreateCourseGraphConnection(ctx, db.CreateCourseGraphConnectionParams{
				FromCoursePhaseID: updatedPhaseOrder.OrderedPhases[i],
				ToCoursePhaseID:   updatedPhaseOrder.OrderedPhases[i+1],
			})
			if err != nil {
				return err
			}
		}
	}

	// reset initial phase to not conflict with unique constraint
	if err = CourseServiceSingleton.queries.UpdateInitialCoursePhase(ctx, db.UpdateInitialCoursePhaseParams{
		CourseID: courseID,
		ID:       uuid.UUID{},
	}); err != nil {
		return err
	}

	if len(updatedPhaseOrder.OrderedPhases) > 0 {
		err = CourseServiceSingleton.queries.UpdateInitialCoursePhase(ctx, db.UpdateInitialCoursePhaseParams{
			CourseID: courseID,
			ID:       updatedPhaseOrder.OrderedPhases[0],
		})
		if err != nil {
			return err
		}

	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
