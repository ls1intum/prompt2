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
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/meta"
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
	courses, err := GetAllCourses(suite.ctx, map[string]bool{keycloak.PromptAdmin: true})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), len(courses), 10, "Expected all courses")

	for _, course := range courses {
		assert.NotEmpty(suite.T(), course.ID, "Course ID should not be empty")
		assert.NotEmpty(suite.T(), course.Name, "Course Name should not be empty")
	}
}

func (suite *CourseServiceTestSuite) TestGetAllCoursesWithRestriction() {
	courses, err := GetAllCourses(suite.ctx, map[string]bool{"Another TEst-ios2425-Lecturer": true})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), 1, len(courses), "Expected to get only one course")

	for _, course := range courses {
		assert.NotEmpty(suite.T(), course.ID, "Course ID should not be empty")
		assert.NotEmpty(suite.T(), course.Name, "Course Name should not be empty")
	}
}

func (suite *CourseServiceTestSuite) TestGetAllCoursesWithStudent() {
	courses, err := GetAllCourses(suite.ctx, map[string]bool{"Another TEst-ios2425-Student": true})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), 1, len(courses), "Expected to get only one course")

	for _, course := range courses {
		assert.NotEmpty(suite.T(), course.ID, "Course ID should not be empty")
		assert.NotEmpty(suite.T(), course.Name, "Course Name should not be empty")
		// Ensure that restricted data is not present
		assert.Empty(suite.T(), course.RestrictedData, "Course should not have restricted data")
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
		Name:                "New Course",
		StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
		EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
		SemesterTag:         pgtype.Text{String: "WS2024", Valid: true},
		RestrictedData:      meta.MetaData{"key": "value"},
		StudentReadableData: meta.MetaData{"differentKey": "value"},
		CourseType:          db.CourseType("practical course"),
		Ects:                pgtype.Int4{Int32: 10, Valid: true},
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

	// Construct the graph to represent the new phase order:
	// firstUUID -> secondUUID -> thirdUUID
	graphUpdate := courseDTO.UpdateCoursePhaseGraph{
		InitialPhase: firstUUID,
		PhaseGraph: []courseDTO.CoursePhaseGraph{
			{
				FromCoursePhaseID: firstUUID,
				ToCoursePhaseID:   secondUUID,
			},
			{
				FromCoursePhaseID: secondUUID,
				ToCoursePhaseID:   thirdUUID,
			},
		},
	}

	err := UpdateCoursePhaseOrder(suite.ctx, courseID, graphUpdate)
	assert.NoError(suite.T(), err, "Updating course phase order should not produce an error")

	// Verify phase order has been updated
	course, err := GetCourseByID(suite.ctx, courseID)
	assert.NoError(suite.T(), err, "Fetching updated course should not produce an error")

	var firstCoursePhase, secondCoursePhase, thirdCoursePhase *coursePhaseDTO.CoursePhaseSequence

	for _, phase := range course.CoursePhases {
		switch phase.SequenceOrder {
		case 1:
			firstCoursePhase = &phase
		case 2:
			secondCoursePhase = &phase
		case 3:
			thirdCoursePhase = &phase
		}
	}

	// Ensure that each found phase matches the expected UUID
	assert.NotNil(suite.T(), firstCoursePhase, "First course phase should be found")
	assert.NotNil(suite.T(), secondCoursePhase, "Second course phase should be found")
	assert.NotNil(suite.T(), thirdCoursePhase, "Third course phase should be found")

	assert.Equal(suite.T(), firstUUID, firstCoursePhase.ID, "First phase UUID should match")
	assert.Equal(suite.T(), secondUUID, secondCoursePhase.ID, "Second phase UUID should match")
	assert.Equal(suite.T(), thirdUUID, thirdCoursePhase.ID, "Third phase UUID should match")

	// Validate initial phase flags
	assert.True(suite.T(), firstCoursePhase.IsInitialPhase, "First phase should be the initial phase")
	assert.False(suite.T(), secondCoursePhase.IsInitialPhase, "Second phase should not be the initial phase")
	assert.False(suite.T(), thirdCoursePhase.IsInitialPhase, "Third phase should not be the initial phase")
}

func TestCourseServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CourseServiceTestSuite))
}
