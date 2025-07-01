package course

import (
	"context"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	"github.com/ls1intum/prompt2/servers/core/coursePhase"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CopyCourseTestSuite struct {
	suite.Suite
	ctx           context.Context
	cleanup       func()
	courseService CourseService
	sourceCourse  db.Course
}

func (suite *CopyCourseTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/copy_course_test.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.courseService = CourseService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
		createCourseGroupsAndRoles: func(ctx context.Context, courseName, semesterTag, userID string) error {
			return nil
		},
	}
	CourseServiceSingleton = &suite.courseService
	coursePhase.InitCoursePhaseModule(gin.Default().Group("/api"), *testDB.Queries, testDB.Conn)

	// Use the known UUID from the dump
	sourceID := uuid.MustParse("c1f8060d-7381-4b64-a6ea-5ba8e8ac88dd")
	suite.sourceCourse, err = testDB.Queries.GetCourse(suite.ctx, sourceID)
	assert.NoError(suite.T(), err)
}

func (suite *CopyCourseTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CopyCourseTestSuite) TestCopyCourseInternal() {
	newName := "Cloned Course"
	newTag := "SS2025"
	newStartDate := pgtype.Date{Valid: true, Time: time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)}
	newEndDate := pgtype.Date{Valid: true, Time: time.Date(2025, 6, 30, 0, 0, 0, 0, time.UTC)}

	copyReq := courseDTO.CopyCourseRequest{
		Name:        newName,
		SemesterTag: pgtype.Text{Valid: true, String: newTag},
		StartDate:   newStartDate,
		EndDate:     newEndDate,
	}

	result, err := copyCourseInternal(suite.ctx, suite.sourceCourse.ID, copyReq, "test_user")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newName, result.Name)
	assert.Equal(suite.T(), newTag, result.SemesterTag.String)

	// Verify phase graph
	newGraph, err := CourseServiceSingleton.queries.GetCoursePhaseGraph(suite.ctx, result.ID)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), newGraph, "Expected course phase graph to be copied")

	// Verify initial phase
	sequence, err := CourseServiceSingleton.queries.GetCoursePhaseSequence(suite.ctx, result.ID)
	assert.NoError(suite.T(), err)
	foundInitial := false
	for _, p := range sequence {
		if p.IsInitialPhase {
			foundInitial = true
			break
		}
	}
	assert.True(suite.T(), foundInitial, "Expected initial phase to be set")
	assert.NotEmpty(suite.T(), sequence, "Expected course phase sequence to be copied")

	partGraph, err := CourseServiceSingleton.queries.GetParticipationDataGraph(suite.ctx, result.ID)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), partGraph, "Expected participation meta data graph to be copied")

	// Verify application form questions
	applicationPhaseID, err := CourseServiceSingleton.queries.GetApplicationPhaseIDForCourse(suite.ctx, result.ID)
	assert.NoError(suite.T(), err)

	textQuestions, err := CourseServiceSingleton.queries.GetApplicationQuestionsTextForCoursePhase(suite.ctx, applicationPhaseID)
	assert.NoError(suite.T(), err)

	multiSelectQuestions, err := CourseServiceSingleton.queries.GetApplicationQuestionsMultiSelectForCoursePhase(suite.ctx, applicationPhaseID)
	assert.NoError(suite.T(), err)

	assert.True(suite.T(), len(textQuestions) > 0 || len(multiSelectQuestions) > 0, "Expected application form to be copied")
}

func TestCopyCourseTestSuite(t *testing.T) {
	suite.Run(t, new(CopyCourseTestSuite))
}
