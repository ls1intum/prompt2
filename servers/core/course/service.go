package course

import (
	"context"
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseDTO"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	"github.com/ls1intum/prompt2/servers/core/utils"
	log "github.com/sirupsen/logrus"
)

type CourseService struct {
	queries db.Queries
	conn    *pgxpool.Pool
	// use dependency injection for keycloak to allow mocking
	createCourseGroupsAndRoles func(ctx context.Context, courseName, iterationName, userID string) error
}

var CourseServiceSingleton *CourseService

func GetOwnCourseIDs(ctx context.Context, matriculationNumber, universityLogin string) ([]uuid.UUID, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	courses, err := CourseServiceSingleton.queries.GetOwnCourses(ctxWithTimeout, db.GetOwnCoursesParams{
		MatriculationNumber: pgtype.Text{String: matriculationNumber, Valid: true},
		UniversityLogin:     pgtype.Text{String: universityLogin, Valid: true},
	})
	return courses, err
}

func GetAllCourses(ctx context.Context, userRoles map[string]bool) ([]courseDTO.CourseWithPhases, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	var courses []db.Course
	var err error
	// Get all active courses the user is allowed to see
	if userRoles[permissionValidation.PromptAdmin] {
		// get all courses
		courses, err = CourseServiceSingleton.queries.GetAllActiveCoursesAdmin(ctxWithTimeout)
		if err != nil {
			return nil, err
		}
	} else {
		// get restricted courses
		userRolesArray := []string{}
		for key, value := range userRoles {
			if value {
				userRolesArray = append(userRolesArray, key)
			}
		}
		coursesRestricted, err := CourseServiceSingleton.queries.GetAllActiveCoursesRestricted(ctxWithTimeout, userRolesArray)
		if err != nil {
			return nil, err
		}

		for _, course := range coursesRestricted {
			courses = append(courses, db.Course(course))
		}
	}

	// Get all course phases for each course
	dtoCourses := make([]courseDTO.CourseWithPhases, 0, len(courses))
	for _, course := range courses {
		// Get all course phases for the course
		coursePhases, err := GetCoursePhasesForCourseID(ctx, course.ID)
		if err != nil {
			return nil, err
		}

		courseWithPhases, err := courseDTO.GetCourseWithPhasesDTOFromDBModel(course)
		if err != nil {
			return nil, err
		}

		courseWithPhases.CoursePhases = coursePhases

		dtoCourses = append(dtoCourses, courseWithPhases)
	}

	return dtoCourses, nil
}

func GetCoursePhasesForCourseID(ctx context.Context, courseID uuid.UUID) ([]coursePhaseDTO.CoursePhaseSequence, error) {
	// Get all course phases in order
	coursePhasesOrder, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(ctx, courseID)
	if err != nil {
		return nil, err
	}

	// get all coursePhases out of order
	coursePhasesNoOrder, err := CourseServiceSingleton.queries.GetNotOrderedCoursePhases(ctx, courseID)
	if err != nil {
		return nil, err
	}

	coursePhaseDTO, err := coursePhaseDTO.GetCoursePhaseSequenceDTO(coursePhasesOrder, coursePhasesNoOrder)
	if err != nil {
		return nil, err

	}
	return coursePhaseDTO, nil
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

	CourseWithPhases, err := courseDTO.GetCourseWithPhasesDTOFromDBModel(course)
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
	defer utils.DeferRollback(tx, ctx)
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

	// create keycloak roles - also add the requester to the course lecturer role
	err = CourseServiceSingleton.createCourseGroupsAndRoles(ctx, createdCourse.Name, createdCourse.SemesterTag.String, requesterID)
	if err != nil {
		log.Error("Failed to create keycloak roles for course: ", err)
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
	defer utils.DeferRollback(tx, ctx)
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

func GetParticipationDataGraph(ctx context.Context, courseID uuid.UUID) ([]courseDTO.MetaDataGraphItem, error) {
	graph, err := CourseServiceSingleton.queries.GetParticipationDataGraph(ctx, courseID)
	if err != nil {
		return nil, err
	}

	dtoGraph := make([]courseDTO.MetaDataGraphItem, 0, len(graph))
	for _, g := range graph {
		dtoGraph = append(dtoGraph, courseDTO.MetaDataGraphItem{
			FromCoursePhaseID:    g.FromCoursePhaseID,
			ToCoursePhaseID:      g.ToCoursePhaseID,
			FromCoursePhaseDtoID: g.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   g.ToCoursePhaseDtoID,
		})
	}
	return dtoGraph, nil
}

func GetPhaseDataGraph(ctx context.Context, courseID uuid.UUID) ([]courseDTO.MetaDataGraphItem, error) {
	graph, err := CourseServiceSingleton.queries.GetPhaseDataGraph(ctx, courseID)
	if err != nil {
		return nil, err
	}

	dtoGraph := make([]courseDTO.MetaDataGraphItem, 0, len(graph))
	for _, g := range graph {
		dtoGraph = append(dtoGraph, courseDTO.MetaDataGraphItem{
			FromCoursePhaseID:    g.FromCoursePhaseID,
			ToCoursePhaseID:      g.ToCoursePhaseID,
			FromCoursePhaseDtoID: g.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   g.ToCoursePhaseDtoID,
		})
	}
	return dtoGraph, nil
}

func UpdateParticipationDataGraph(ctx context.Context, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer utils.DeferRollback(tx, ctx)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	// delete all previous connections
	err = qtx.DeleteParticipationDataGraphConnections(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate {
		err = qtx.CreateParticipationDataConnection(ctx, db.CreateParticipationDataConnectionParams{
			FromCoursePhaseID:    graphItem.FromCoursePhaseID,
			ToCoursePhaseID:      graphItem.ToCoursePhaseID,
			FromCoursePhaseDtoID: graphItem.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   graphItem.ToCoursePhaseDtoID,
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

func UpdatePhaseDataGraph(ctx context.Context, courseID uuid.UUID, graphUpdate []courseDTO.MetaDataGraphItem) error {
	tx, err := CourseServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer utils.DeferRollback(tx, ctx)
	qtx := CourseServiceSingleton.queries.WithTx(tx)

	// delete all previous connections
	err = qtx.DeletePhaseDataGraphConnections(ctx, courseID)
	if err != nil {
		return err
	}

	// create new connections
	for _, graphItem := range graphUpdate {
		err = qtx.CreatePhaseDataConnection(ctx, db.CreatePhaseDataConnectionParams{
			FromCoursePhaseID:    graphItem.FromCoursePhaseID,
			ToCoursePhaseID:      graphItem.ToCoursePhaseID,
			FromCoursePhaseDtoID: graphItem.FromCoursePhaseDtoID,
			ToCoursePhaseDtoID:   graphItem.ToCoursePhaseDtoID,
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

func DeleteCourse(ctx context.Context, courseID uuid.UUID) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	err := CourseServiceSingleton.queries.DeleteCourse(ctxWithTimeout, courseID)
	if err != nil {
		log.Error(err)
		return errors.New("failed to delete course")
	}

	return nil
}

func CopyCourse(c *gin.Context, sourceCourseID uuid.UUID, courseVariables courseDTO.CopyCourseRequest, requesterID string) (courseDTO.Course, error) {
	return copyCourseInternal(c, sourceCourseID, courseVariables, requesterID)
}
