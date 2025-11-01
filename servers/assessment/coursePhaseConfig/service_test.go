package coursePhaseConfig

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

// Helper function to create a test course phase config request
func createTestCoursePhaseConfigRequest(templateID, coursePhaseID uuid.UUID) coursePhaseConfigDTO.CreateOrUpdateCoursePhaseConfigRequest {
	now := time.Now()
	selfTemplateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440001")  // From test data
	peerTemplateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440002")  // From test data
	tutorTemplateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440003") // From test data

	return coursePhaseConfigDTO.CreateOrUpdateCoursePhaseConfigRequest{
		AssessmentTemplateID:     templateID,
		CoursePhaseID:            coursePhaseID,
		Start:                    now,
		Deadline:                 now.Add(7 * 24 * time.Hour),
		SelfEvaluationEnabled:    false,
		SelfEvaluationTemplate:   selfTemplateID,
		SelfEvaluationStart:      now,
		SelfEvaluationDeadline:   now.Add(14 * 24 * time.Hour),
		PeerEvaluationEnabled:    false,
		PeerEvaluationTemplate:   peerTemplateID,
		PeerEvaluationStart:      now,
		PeerEvaluationDeadline:   now.Add(21 * 24 * time.Hour),
		TutorEvaluationEnabled:   false,
		TutorEvaluationTemplate:  tutorTemplateID,
		TutorEvaluationStart:     now,
		TutorEvaluationDeadline:  now.Add(28 * 24 * time.Hour),
		EvaluationResultsVisible: false,
		// GradeSuggestionVisible and ActionItemsVisible are nil by default (pointer fields)
	}
}

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

func (suite *CoursePhaseConfigServiceTestSuite) TestCreateOrUpdateCoursePhaseConfig_DefaultVisibilitySettings() {
	// Test that when GradeSuggestionVisible and ActionItemsVisible are nil (not provided),
	// they default to TRUE as per database defaults
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// Create request with nil visibility settings (using pointer fields)
	req := createTestCoursePhaseConfigRequest(templateID, testID)
	// Both fields are nil by default in the test helper

	err := CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, req)
	assert.NoError(suite.T(), err, "Should successfully create config with nil visibility settings")

	// Verify the config was created with TRUE defaults
	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err, "Should be able to get the created config")
	assert.True(suite.T(), config.GradeSuggestionVisible, "GradeSuggestionVisible should default to TRUE")
	assert.True(suite.T(), config.ActionItemsVisible, "ActionItemsVisible should default to TRUE")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestCreateOrUpdateCoursePhaseConfig_ExplicitFalseVisibilitySettings() {
	// Test that when GradeSuggestionVisible and ActionItemsVisible are explicitly set to false,
	// they are stored as FALSE (not overridden by defaults)
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// Create request with explicit false values
	req := createTestCoursePhaseConfigRequest(templateID, testID)
	falseValue := false
	req.GradeSuggestionVisible = &falseValue
	req.ActionItemsVisible = &falseValue

	err := CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, req)
	assert.NoError(suite.T(), err, "Should successfully create config with explicit false values")

	// Verify the config was created with FALSE values
	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err, "Should be able to get the created config")
	assert.False(suite.T(), config.GradeSuggestionVisible, "GradeSuggestionVisible should be FALSE")
	assert.False(suite.T(), config.ActionItemsVisible, "ActionItemsVisible should be FALSE")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestCreateOrUpdateCoursePhaseConfig_ExplicitTrueVisibilitySettings() {
	// Test that when GradeSuggestionVisible and ActionItemsVisible are explicitly set to true,
	// they are stored as TRUE
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// Create request with explicit true values
	req := createTestCoursePhaseConfigRequest(templateID, testID)
	trueValue := true
	req.GradeSuggestionVisible = &trueValue
	req.ActionItemsVisible = &trueValue

	err := CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, req)
	assert.NoError(suite.T(), err, "Should successfully create config with explicit true values")

	// Verify the config was created with TRUE values
	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err, "Should be able to get the created config")
	assert.True(suite.T(), config.GradeSuggestionVisible, "GradeSuggestionVisible should be TRUE")
	assert.True(suite.T(), config.ActionItemsVisible, "ActionItemsVisible should be TRUE")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestUpdateCoursePhaseConfig_PreservesDefaults() {
	// Test that updating a config with nil visibility settings preserves the defaults (TRUE)
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// First, create with defaults
	req := createTestCoursePhaseConfigRequest(templateID, testID)
	err := CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, req)
	assert.NoError(suite.T(), err)

	// Verify initial defaults
	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), config.GradeSuggestionVisible)
	assert.True(suite.T(), config.ActionItemsVisible)

	// Update with nil values (should preserve TRUE)
	updateReq := createTestCoursePhaseConfigRequest(templateID, testID)
	err = CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, updateReq)
	assert.NoError(suite.T(), err, "Should successfully update config")

	// Verify values are still TRUE (preserved by COALESCE)
	updatedConfig, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), updatedConfig.GradeSuggestionVisible, "GradeSuggestionVisible should remain TRUE")
	assert.True(suite.T(), updatedConfig.ActionItemsVisible, "ActionItemsVisible should remain TRUE")
}

func (suite *CoursePhaseConfigServiceTestSuite) TestUpdateCoursePhaseConfig_CanToggleFalseToTrue() {
	// Test that we can update from FALSE to TRUE
	testID := uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	// Create with explicit false values
	req := createTestCoursePhaseConfigRequest(templateID, testID)
	falseValue := false
	req.GradeSuggestionVisible = &falseValue
	req.ActionItemsVisible = &falseValue
	err := CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, req)
	assert.NoError(suite.T(), err)

	// Verify initial values are FALSE
	config, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err)
	assert.False(suite.T(), config.GradeSuggestionVisible)
	assert.False(suite.T(), config.ActionItemsVisible)

	// Update to TRUE
	updateReq := createTestCoursePhaseConfigRequest(templateID, testID)
	trueValue := true
	updateReq.GradeSuggestionVisible = &trueValue
	updateReq.ActionItemsVisible = &trueValue
	err = CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, testID, updateReq)
	assert.NoError(suite.T(), err)

	// Verify values are now TRUE
	updatedConfig, err := GetCoursePhaseConfig(suite.suiteCtx, testID)
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), updatedConfig.GradeSuggestionVisible, "GradeSuggestionVisible should be TRUE")
	assert.True(suite.T(), updatedConfig.ActionItemsVisible, "ActionItemsVisible should be TRUE")
}

// Note: GetTeamsForCoursePhase testing is limited because it requires external HTTP calls
// to the core service. The router tests above verify the endpoint behavior and error handling.
// The service function includes safe type assertions that prevent runtime panics when
// the external API returns unexpected data structures.
func TestCoursePhaseConfigServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseConfigServiceTestSuite))
}
