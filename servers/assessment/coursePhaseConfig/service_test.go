package coursePhaseConfig

import (
	"context"
	"testing"

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
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")     // From our test data
	selfTemplateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440001") // Self assessment template
	peerTemplateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440002") // Peer assessment template

	// Insert a course phase config entry to enable updates
	_, err = testDB.Conn.Exec(suite.suiteCtx,
		`INSERT INTO course_phase_config (assessment_template_id, course_phase_id, self_evaluation_template, peer_evaluation_template) 
		 VALUES ($1, $2, $3, $4)`,
		templateID, suite.testCoursePhaseID, selfTemplateID, peerTemplateID)
	if err != nil {
		suite.T().Fatalf("Failed to insert test course phase config: %v", err)
	}
}

func (suite *CoursePhaseConfigServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CoursePhaseConfigServiceTestSuite) TestGetCoursePhaseConfig() {
	// Test getting course phase config
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// Insert a course phase config entry first
	_, err := suite.coursePhaseConfigService.conn.Exec(suite.suiteCtx,
		"INSERT INTO course_phase_config (assessment_template_id, course_phase_id) VALUES ($1, $2)",
		templateID, testID)
	assert.NoError(suite.T(), err)

	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err, "Should be able to get course phase config")
	assert.NotNil(suite.T(), config, "Config should not be nil")
}

// Note: GetTeamsForCoursePhase testing is limited because it requires external HTTP calls
// to the core service. The router tests above verify the endpoint behavior and error handling.
// The service function includes safe type assertions that prevent runtime panics when
// the external API returns unexpected data structures.
func TestCoursePhaseConfigServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseConfigServiceTestSuite))
}
