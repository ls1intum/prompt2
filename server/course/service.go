package course

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CourseService struct {
	queries db.Queries
	conn    *pgx.Conn
}

var CourseServiceSingleton *CourseService

func GetAllCourses(ctx context.Context) ([]courseDTO.CourseWithPhases, error) {
	courses, err := CourseServiceSingleton.queries.GetAllActiveCourses(ctx)
	if err != nil {
		return nil, err
	}

	// TODO rewrite this cleaner!!!
	dtoCourses := make([]courseDTO.CourseWithPhases, 0, len(courses))
	for _, course := range courses {
		dtoCourse, err := GetCourseByID(ctx, course.ID)
		if err != nil {
			return nil, err
		}
		dtoCourses = append(dtoCourses, dtoCourse)
	}
	return dtoCourses, nil
}

func GetCourseByID(ctx context.Context, id uuid.UUID) (courseDTO.CourseWithPhases, error) {
	// TODO: replace with query to get the course incl phases
	course, err := CourseServiceSingleton.queries.GetCourse(ctx, id)
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

func CreateCourse(ctx context.Context, course courseDTO.CreateCourse) (courseDTO.Course, error) {
	createCourseParams, err := course.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, err
	}

	createCourseParams.ID = uuid.New()
	createdCourse, err := CourseServiceSingleton.queries.CreateCourse(ctx, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, err
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
