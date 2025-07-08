package copy

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/ls1intum/prompt2/servers/core/course/copy/courseCopyDTO"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	"github.com/ls1intum/prompt2/servers/core/utils"
	log "github.com/sirupsen/logrus"
)

// copyCourseInternal creates a deep copy of the given course.
// It copies phases, metadata, DTO mappings, graphs, and the application form if present.
// It also creates course-specific Keycloak roles and groups.
// The function runs within a database transaction.
func copyCourseInternal(c *gin.Context, sourceCourseID uuid.UUID, courseVariables courseCopyDTO.CopyCourseRequest, requesterID string) (courseDTO.Course, error) {
	sourceCourse, err := CourseCopyServiceSingleton.queries.GetCourse(c, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to fetch source course: %w", err)
	}

	restrictedData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.RestrictedData)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert restricted data: %w", err)
	}
	studentReadableData, err := meta.GetMetaDataDTOFromDBModel(sourceCourse.StudentReadableData)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert student readable data: %w", err)
	}

	newCourse := courseDTO.CreateCourse{
		Name:                courseVariables.Name,
		StartDate:           courseVariables.StartDate,
		EndDate:             courseVariables.EndDate,
		SemesterTag:         courseVariables.SemesterTag,
		RestrictedData:      restrictedData,
		StudentReadableData: studentReadableData,
		CourseType:          sourceCourse.CourseType,
		Ects:                sourceCourse.Ects,
	}

	tx, err := CourseCopyServiceSingleton.conn.Begin(c)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer utils.DeferRollback(tx, c)
	qtx := CourseCopyServiceSingleton.queries.WithTx(tx)

	createCourseParams, err := newCourse.GetDBModel()
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to convert course to DB model: %w", err)
	}
	createCourseParams.ID = uuid.New()

	createdCourse, err := qtx.CreateCourse(c, createCourseParams)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to create course in DB: %w", err)
	}

	phaseIDMap, err := copyCoursePhases(c, qtx, sourceCourseID, createdCourse.ID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy course phases: %w", err)
	}

	if err := copyCoursePhaseGraph(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy course phase graph: %w", err)
	}

	if err := setInitialPhase(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to set initial phase: %w", err)
	}

	dtoIDMap, err := copyDTOs(c, qtx, sourceCourseID)
	if err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy DTOs: %w", err)
	}

	if err := copyMetaGraphs(c, qtx, sourceCourseID, createdCourse.ID, phaseIDMap, dtoIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy meta graphs: %w", err)
	}

	sourceApplicationPhaseID, err := getApplicationPhaseID(c, qtx, sourceCourseID)
	if err != nil && err != pgx.ErrNoRows {
		return courseDTO.Course{}, fmt.Errorf("failed to get source application phase ID: %w", err)
	}

	targetApplicationPhaseID, err := getApplicationPhaseID(c, qtx, createdCourse.ID)
	if err != nil && err != pgx.ErrNoRows {
		return courseDTO.Course{}, fmt.Errorf("failed to get target application phase ID: %w", err)
	}

	if sourceApplicationPhaseID != uuid.Nil && targetApplicationPhaseID != uuid.Nil {
		if err := copyApplicationForm(c, qtx, sourceApplicationPhaseID, targetApplicationPhaseID); err != nil {
			return courseDTO.Course{}, fmt.Errorf("failed to copy application form: %w", err)
		}
	}

	if err := CourseCopyServiceSingleton.createCourseGroupsAndRoles(c, createdCourse.Name, createdCourse.SemesterTag.String, requesterID); err != nil {
		log.Error("failed to create keycloak roles for course: ", err)
		return courseDTO.Course{}, fmt.Errorf("failed to create keycloak roles/groups: %w", err)
	}

	if err := tx.Commit(c); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to commit course transaction: %w", err)
	}

	if err := copyPhaseConfigurations(c, qtx, phaseIDMap); err != nil {
		return courseDTO.Course{}, fmt.Errorf("failed to copy phase configurations: %w", err)
	}

	return courseDTO.GetCourseDTOFromDBModel(createdCourse)
}

// getApplicationPhaseID returns the ID of the application phase for the given course.
// If no application phase exists, it returns uuid.Nil and pgx.ErrNoRows.
func getApplicationPhaseID(c *gin.Context, qtx *db.Queries, courseID uuid.UUID) (uuid.UUID, error) {
	applicationPhaseID, err := qtx.GetApplicationPhaseIDForCourse(c, courseID)
	if err != nil {
		return uuid.Nil, err
	}
	return applicationPhaseID, nil
}
