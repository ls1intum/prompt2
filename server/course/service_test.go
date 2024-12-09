package course

import (
	"context"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CourseServiceTestSuite struct {
	suite.Suite
	router        *gin.Engine
	ctx           context.Context
	cleanup       func()
	courseService CourseService
}

func (suite *CourseServiceTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/course_test.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}

	mockCreateGroupsAndRoles := func(ctx context.Context, courseName, iterationName string) error {
		// No-op or add assertions for test
		return nil
	}

	mockAddUserToGroup := func(ctx context.Context, userID, groupName string) error {
		// No-op or add assertions for test
		return nil
	}

	suite.cleanup = cleanup
	suite.courseService = CourseService{
		queries:                    *testDB.Queries,
		conn:                       testDB.Conn,
		createCourseGroupsAndRoles: mockCreateGroupsAndRoles,
		addUserToGroup:             mockAddUserToGroup,
	}

	CourseServiceSingleton = &suite.courseService

	// Initialize CoursePhase module
	suite.router = gin.Default()
	coursePhase.InitCoursePhaseModule(suite.router.Group("/api"), *testDB.Queries, testDB.Conn)
}

func (suite *CourseServiceTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CourseServiceTestSuite) TestGetAllCourses() {
	courses, err := GetAllCourses(suite.ctx)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(courses), 0, "Expected at least one course")

	for _, course := range courses {
		assert.NotEmpty(suite.T(), course.ID, "Course ID should not be empty")
		assert.NotEmpty(suite.T(), course.Name, "Course Name should not be empty")
	}
}

func (suite *CourseServiceTestSuite) TestGetCourseByID() {
	courseID := uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e")

	course, err := GetCourseByID(suite.ctx, courseID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), courseID, course.ID, "Course ID should match")
	assert.NotEmpty(suite.T(), course.CoursePhases, "Course should have phases")
}

func (suite *CourseServiceTestSuite) TestCreateCourse() {
	newCourse := courseDTO.CreateCourse{
		Name:        "New Course",
		StartDate:   pgtype.Date{Valid: true, Time: time.Now()},
		EndDate:     pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
		SemesterTag: pgtype.Text{String: "WS2024", Valid: true},
		MetaData:    map[string]interface{}{"test_key": "test_value"},
		CourseType:  db.CourseType("practical course"),
		Ects:        pgtype.Int4{Int32: 10, Valid: true},
	}

	createdCourse, err := CreateCourse(suite.ctx, newCourse, "test_user")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newCourse.Name, createdCourse.Name, "Course name should match")
	assert.Equal(suite.T(), "practical course", createdCourse.CourseType, "Course type should match")
}

func (suite *CourseServiceTestSuite) TestUpdateCoursePhaseOrder() {
	courseID := uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e")
	firstUUID := uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b")
	secondUUID := uuid.MustParse("500db7ed-2eb2-42d0-82b3-8750e12afa8a")
	thirdUUID := uuid.MustParse("92bb0532-39e5-453d-bc50-fa61ea0128b2")
	newPhaseOrder := courseDTO.CoursePhaseOrderRequest{
		OrderedPhases: []uuid.UUID{
			firstUUID,
			secondUUID,
			thirdUUID,
		},
	}

	err := UpdateCoursePhaseOrder(suite.ctx, courseID, newPhaseOrder)
	assert.NoError(suite.T(), err)

	// Verify phase order has been updated
	course, err := GetCourseByID(suite.ctx, courseID)
	assert.NoError(suite.T(), err)
	var firstCoursePhase *coursePhaseDTO.CoursePhaseSequence
	var secondCoursePhase *coursePhaseDTO.CoursePhaseSequence
	var thirdCoursePhase *coursePhaseDTO.CoursePhaseSequence

	for _, phase := range course.CoursePhases {
		if phase.SequenceOrder == 1 {
			firstCoursePhase = &phase
		}
		if phase.SequenceOrder == 2 {
			secondCoursePhase = &phase
		}
		if phase.SequenceOrder == 3 {
			thirdCoursePhase = &phase
		}
	}
	assert.Equal(suite.T(), firstUUID, firstCoursePhase.ID, "Phase order should match")
	assert.Equal(suite.T(), secondUUID, secondCoursePhase.ID, "Phase order should match")
	assert.Equal(suite.T(), thirdUUID, thirdCoursePhase.ID, "Phase order should match")

	assert.True(suite.T(), firstCoursePhase.IsInitialPhase, "First phase should be initial phase")
	assert.False(suite.T(), secondCoursePhase.IsInitialPhase, "Second phase should not be initial phase")
	assert.False(suite.T(), thirdCoursePhase.IsInitialPhase, "Third phase should not be initial phase")
}

func TestCourseServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CourseServiceTestSuite))
}
