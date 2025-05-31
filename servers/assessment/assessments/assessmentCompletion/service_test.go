package assessmentCompletion

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type AssessmentCompletionServiceTestSuite struct {
	suite.Suite
	suiteCtx context.Context
	cleanup  func()
	service  AssessmentCompletionService
}

func (suite *AssessmentCompletionServiceTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../../database_dumps/assessmentCompletions.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.service = AssessmentCompletionService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	AssessmentCompletionServiceSingleton = &suite.service
}

func (suite *AssessmentCompletionServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *AssessmentCompletionServiceTestSuite) TestCheckAssessmentCompletionExists() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.MustParse("319f28d4-8877-400e-9450-d49077aae7fe")
	exists, err := CheckAssessmentCompletionExists(suite.suiteCtx, partID, phaseID)
	assert.NoError(suite.T(), err)
	assert.False(suite.T(), exists, "Expected no assessment completion initially")
}

func (suite *AssessmentCompletionServiceTestSuite) TestCountRemainingAssessmentsForStudent() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.MustParse("319f28d4-8877-400e-9450-d49077aae7fe")
	remaining, err := CountRemainingAssessmentsForStudent(suite.suiteCtx, partID, phaseID)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), remaining.RemainingAssessments, int32(0), "Expected remaining assessments > 0")
}

func (suite *AssessmentCompletionServiceTestSuite) TestUnmarkAssessmentAsCompletedNonExisting() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.New()
	err := UnmarkAssessmentAsCompleted(suite.suiteCtx, partID, phaseID)
	assert.NoError(suite.T(), err, "Unmarking non-existent completion should not error")
}

func (suite *AssessmentCompletionServiceTestSuite) TestListAssessmentCompletionsByCoursePhase() {
	phaseID := uuid.MustParse("319f28d4-8877-400e-9450-d49077aae7fe")
	completions, err := ListAssessmentCompletionsByCoursePhase(suite.suiteCtx, phaseID)
	assert.NoError(suite.T(), err)
	assert.Empty(suite.T(), completions, "Expected no completions initially")
}

func (suite *AssessmentCompletionServiceTestSuite) TestGetAssessmentCompletionNotFound() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.New()
	_, err := GetAssessmentCompletion(suite.suiteCtx, partID, phaseID)
	assert.Error(suite.T(), err, "Expected error for non-existent completion")
}

func TestAssessmentCompletionServiceTestSuite(t *testing.T) {
	suite.Run(t, new(AssessmentCompletionServiceTestSuite))
}
