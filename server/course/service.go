package course

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type CourseService struct {
	queries db.Queries
	conn    *pgxpool.Pool
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
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	createCourseParams, err := course.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, err
	}

	createCourseParams.ID = uuid.New()
	createdCourse, err := qtx.CreateCourse(ctx, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, err
	}

	// create keycloak roles
	err = CourseServiceSingleton.createCourseGroupsAndRoles(ctx, createdCourse.Name, createdCourse.SemesterTag.String)
	if err != nil {
		log.Error("Failed to create keycloak roles for course: ", err)
		tx.Rollback(ctx)
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

func UpdateCoursePhaseOrder(ctx context.Context, courseID uuid.UUID, graphUpdate courseDTO.UpdateCoursePhaseGraph) error {
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	// delete all previous connections
	err = qtx.DeleteCourseGraph(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate.PhaseGraph {
		err = qtx.CreateCourseGraphConnection(ctx, db.CreateCourseGraphConnectionParams{
			FromCoursePhaseID: graphItem.FromCoursePhaseID,
			ToCoursePhaseID:   graphItem.ToCoursePhaseID,
		})
		if err != nil {
			log.Error("Error creating graph connection: ", err)
			return err
		}
	}

	// reset initial phase to not conflict with unique constraint
	if err = qtx.UpdateInitialCoursePhase(ctx, db.UpdateInitialCoursePhaseParams{
		CourseID: courseID,
		ID:       uuid.UUID{},
	}); err != nil {
		return err
	}

	err = qtx.UpdateInitialCoursePhase(ctx, db.UpdateInitialCoursePhaseParams{
		CourseID: courseID,
		ID:       graphUpdate.InitialPhase,
	})
	if err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func GetCoursePhaseGraph(ctx context.Context, courseID uuid.UUID) ([]courseDTO.CoursePhaseGraph, error) {
	graph, err := CourseServiceSingleton.queries.GetCoursePhaseGraph(ctx, courseID)
	if err != nil {
		return nil, err
	}

	dtoGraph := make([]courseDTO.CoursePhaseGraph, 0, len(graph))
	for _, g := range graph {
		dtoGraph = append(dtoGraph, courseDTO.CoursePhaseGraph{
			FromCoursePhaseID: g.FromCoursePhaseID,
			ToCoursePhaseID:   g.ToCoursePhaseID,
		})
	}
	return dtoGraph, nil
}

func GetMetaDataGraph(ctx context.Context, courseID uuid.UUID) ([]courseDTO.MetaDataGraphItem, error) {
	graph, err := CourseServiceSingleton.queries.GetMetaDataGraph(ctx, courseID)
	if err != nil {
		return nil, err
	}

	dtoGraph := make([]courseDTO.MetaDataGraphItem, 0, len(graph))
	for _, g := range graph {
		dtoGraph = append(dtoGraph, courseDTO.MetaDataGraphItem{
			FromCoursePhaseID: g.FromPhaseID,
			ToCoursePhaseID:   g.ToPhaseID,
		})
	}
	return dtoGraph, nil
}

func UpdateMetaDataGraph(ctx context.Context, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	// delete all previous connections
	err = qtx.DeleteMetaDataGraphConnections(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate {
		err = qtx.CreateMetaDataConnection(ctx, db.CreateMetaDataConnectionParams{
			FromPhaseID: graphItem.FromCoursePhaseID,
			ToPhaseID:   graphItem.ToCoursePhaseID,
		})
		if err != nil {
			log.Error("Error creating graph connection: ", err)
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil

}

func UpdateCourseData(ctx context.Context, courseID uuid.UUID, courseData courseDTO.UpdateCourseData) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	updateCourseParams, err := courseData.GetDBModel()
	if err != nil {
		log.Error(err)
		return errors.New("failed to update course data")
	}

	updateCourseParams.ID = courseID

	err = CourseServiceSingleton.queries.UpdateCourse(ctxWithTimeout, updateCourseParams)
	if err != nil {
		log.Error(err)
		return errors.New("failed to update course data")
	}

	return nil
}
