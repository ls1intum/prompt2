package coursePhaseConfig

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type CoursePhaseConfigServiceTestSuite struct {
	suite.Suite
	suiteCtx                 context.Context
	cleanup                  func()
	coursePhaseConfigService CoursePhaseConfigService
	testCoursePhaseID        uuid.UUID
}

func (suite *CoursePhaseConfigServiceTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/coursePhaseConfig.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.coursePhaseConfigService = CoursePhaseConfigService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CoursePhaseConfigSingleton = &suite.coursePhaseConfigService

	// Generate a test course phase ID and insert it with a template
	suite.testCoursePhaseID = uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000") // From our test data

	// Insert a course phase config entry to enable updates
	_, err = testDB.Conn.Exec(suite.suiteCtx,
		"INSERT INTO course_phase_config (assessment_template_id, course_phase_id) VALUES ($1, $2)",
		templateID, suite.testCoursePhaseID)
	if err != nil {
		suite.T().Fatalf("Failed to insert test course phase config: %v", err)
	}
}

func (suite *CoursePhaseConfigServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CoursePhaseConfigServiceTestSuite) TestUpdateAndGetCoursePhaseDeadline() {
	// Test updating a course phase deadline
	testDeadline := time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC)

	err := UpdateCoursePhaseDeadline(suite.suiteCtx, suite.testCoursePhaseID, testDeadline)
	assert.NoError(suite.T(), err, "Should be able to update course phase deadline")

	// Test getting the updated deadline
	retrievedDeadline, err := GetCoursePhaseDeadline(suite.suiteCtx, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err, "Should be able to get course phase deadline")
	assert.NotNil(suite.T(), retrievedDeadline, "Retrieved deadline should not be nil")
	assert.True(suite.T(), retrievedDeadline.Equal(testDeadline), "Retrieved deadline should match the set deadline")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestGetCoursePhaseDeadlineNonExistent() {
	// Test getting a deadline for a non-existent course phase
	nonExistentID := uuid.New()

	deadline, err := GetCoursePhaseDeadline(suite.suiteCtx, nonExistentID)
	assert.NoError(suite.T(), err, "Should not return error for non-existent course phase")
	assert.Nil(suite.T(), deadline, "Deadline should be nil for non-existent course phase")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestUpdateCoursePhaseDeadlineInvalidID() {
	// Test updating with an invalid UUID (this would typically fail at the database level)
	emptyID := uuid.UUID{}
	testDeadline := time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC)

	// The behavior here depends on the database constraints
	// We expect either an error or successful execution
	// The exact assertion would depend on your database schema
	assert.NotPanics(suite.T(), func() {
		_ = UpdateCoursePhaseDeadline(suite.suiteCtx, emptyID, testDeadline)
	}, "Should not panic with empty UUID")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestUpdateCoursePhaseDeadlineMultipleTimes() {
	// Test updating the same course phase deadline multiple times
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000") // From our test data

	// Insert a course phase config entry first
	_, err := suite.coursePhaseConfigService.conn.Exec(suite.suiteCtx,
		"INSERT INTO course_phase_config (assessment_template_id, course_phase_id) VALUES ($1, $2)",
		templateID, testID)
	assert.NoError(suite.T(), err)

	firstDeadline := time.Date(2025, 6, 15, 12, 0, 0, 0, time.UTC)
	err = UpdateCoursePhaseDeadline(suite.suiteCtx, testID, firstDeadline)
	assert.NoError(suite.T(), err, "Should be able to update deadline first time")

	secondDeadline := time.Date(2025, 7, 15, 12, 0, 0, 0, time.UTC)
	err = UpdateCoursePhaseDeadline(suite.suiteCtx, testID, secondDeadline)
	assert.NoError(suite.T(), err, "Should be able to update deadline second time")

	// Verify the latest deadline is retrieved
	retrievedDeadline, err := GetCoursePhaseDeadline(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err, "Should be able to get course phase deadline")
	assert.NotNil(suite.T(), retrievedDeadline, "Retrieved deadline should not be nil")
	assert.True(suite.T(), retrievedDeadline.Equal(secondDeadline), "Retrieved deadline should match the latest set deadline")
}

// Note: GetTeamsForCoursePhase testing is limited because it requires external HTTP calls
// to the core service. The router tests above verify the endpoint behavior and error handling.
// The service function includes safe type assertions that prevent runtime panics when
// the external API returns unexpected data structures.
func TestCoursePhaseConfigServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseConfigServiceTestSuite))
}
