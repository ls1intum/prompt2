package evaluations

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/evaluations/evaluationDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type EvaluationServiceTestSuite struct {
	suite.Suite
	suiteCtx              context.Context
	cleanup               func()
	evaluationService     EvaluationService
	testCoursePhaseID     uuid.UUID
	testCoursePhaseID2    uuid.UUID
	testParticipantID1    uuid.UUID
	testParticipantID2    uuid.UUID
	testParticipantID3    uuid.UUID
	testCompetencyID1     uuid.UUID
	testCompetencyID2     uuid.UUID
	testCompetencyID3     uuid.UUID
	existingEvaluationID1 uuid.UUID
	existingEvaluationID2 uuid.UUID
}

func (suite *EvaluationServiceTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/evaluations.sql")
	if err != nil {
		suite.T().Fatalf("Failed to setup test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.evaluationService = EvaluationService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}

	EvaluationServiceSingleton = &suite.evaluationService

	// Test data IDs matching the evaluations.sql dump
	suite.testCoursePhaseID = uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	suite.testCoursePhaseID2 = uuid.MustParse("5179d58a-d00d-4fa7-94a5-397bc69fab03")
	suite.testParticipantID1 = uuid.MustParse("01234567-1234-1234-1234-123456789012")
	suite.testParticipantID2 = uuid.MustParse("02234567-1234-1234-1234-123456789012")
	suite.testParticipantID3 = uuid.MustParse("03234567-1234-1234-1234-123456789012")
	suite.testCompetencyID1 = uuid.MustParse("c1234567-1234-1234-1234-123456789012")
	suite.testCompetencyID2 = uuid.MustParse("c2234567-1234-1234-1234-123456789012")
	suite.testCompetencyID3 = uuid.MustParse("c3234567-1234-1234-1234-123456789012")
	suite.existingEvaluationID1 = uuid.MustParse("e1234567-1234-1234-1234-123456789012")
	suite.existingEvaluationID2 = uuid.MustParse("e2234567-1234-1234-1234-123456789012")
}

func (suite *EvaluationServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func TestEvaluationServiceTestSuite(t *testing.T) {
	suite.Run(t, new(EvaluationServiceTestSuite))
}

// Test getting evaluations by phase
func (suite *EvaluationServiceTestSuite) TestGetEvaluationsByPhase() {
	evaluations, err := GetEvaluationsByPhase(suite.suiteCtx, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)
	assert.GreaterOrEqual(suite.T(), len(evaluations), 5) // We expect at least 5 evaluations in phase 1

	// Verify all evaluations belong to the correct phase
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
	}
}

// Test getting self evaluations by phase
func (suite *EvaluationServiceTestSuite) TestGetSelfEvaluationsByPhase() {
	evaluations, err := GetSelfEvaluationsByPhase(suite.suiteCtx, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)

	// Verify all evaluations are self-evaluations (author == participant)
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
		assert.Equal(suite.T(), evaluation.CourseParticipationID, evaluation.AuthorCourseParticipationID)
	}
}

// Test getting self evaluations for a specific participant
func (suite *EvaluationServiceTestSuite) TestGetSelfEvaluationsForParticipantInPhase() {
	evaluations, err := GetSelfEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID1, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)
	assert.GreaterOrEqual(suite.T(), len(evaluations), 2) // We expect at least 2 self-evaluations for participant 1

	// Verify all evaluations are for the correct participant and are self-evaluations
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
		assert.Equal(suite.T(), suite.testParticipantID1, evaluation.CourseParticipationID)
		assert.Equal(suite.T(), suite.testParticipantID1, evaluation.AuthorCourseParticipationID)
	}
}

// Test getting peer evaluations by phase
func (suite *EvaluationServiceTestSuite) TestGetPeerEvaluationsByPhase() {
	evaluations, err := GetPeerEvaluationsByPhase(suite.suiteCtx, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)

	// Verify all evaluations are peer evaluations (author != participant)
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
		assert.NotEqual(suite.T(), evaluation.CourseParticipationID, evaluation.AuthorCourseParticipationID)
	}
}

// Test getting peer evaluations for a specific participant
func (suite *EvaluationServiceTestSuite) TestGetPeerEvaluationsForParticipantInPhase() {
	evaluations, err := GetPeerEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID1, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)

	// Verify all evaluations are for the correct participant and are peer evaluations
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
		assert.Equal(suite.T(), suite.testParticipantID1, evaluation.CourseParticipationID)
		assert.NotEqual(suite.T(), suite.testParticipantID1, evaluation.AuthorCourseParticipationID)
	}
}

// Test getting evaluations by author
func (suite *EvaluationServiceTestSuite) TestGetEvaluationsForAuthorInPhase() {
	evaluations, err := GetEvaluationsForAuthorInPhase(suite.suiteCtx, suite.testParticipantID1, suite.testCoursePhaseID)

	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), evaluations)

	// Verify all evaluations are authored by the correct participant
	for _, evaluation := range evaluations {
		assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
		assert.Equal(suite.T(), suite.testParticipantID1, evaluation.AuthorCourseParticipationID)
	}
}

// Test getting evaluation by ID
func (suite *EvaluationServiceTestSuite) TestGetEvaluationByID() {
	evaluation, err := GetEvaluationByID(suite.suiteCtx, suite.existingEvaluationID1)

	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), suite.existingEvaluationID1, evaluation.ID)
	assert.Equal(suite.T(), suite.testParticipantID1, evaluation.CourseParticipationID)
	assert.Equal(suite.T(), suite.testCoursePhaseID, evaluation.CoursePhaseID)
	assert.Equal(suite.T(), suite.testCompetencyID1, evaluation.CompetencyID)
	assert.Equal(suite.T(), scoreLevelDTO.ScoreLevelGood, evaluation.ScoreLevel)
	assert.Equal(suite.T(), suite.testParticipantID1, evaluation.AuthorCourseParticipationID)
}

// Test getting evaluation by non-existent ID
func (suite *EvaluationServiceTestSuite) TestGetEvaluationByNonExistentID() {
	nonExistentID := uuid.New()
	_, err := GetEvaluationByID(suite.suiteCtx, nonExistentID)

	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "could not get evaluation by ID")
}

// Test creating a new evaluation
func (suite *EvaluationServiceTestSuite) TestCreateOrUpdateEvaluation_Create() {
	request := evaluationDTO.CreateOrUpdateEvaluationRequest{
		CourseParticipationID:       suite.testParticipantID3,
		CompetencyID:                suite.testCompetencyID1,
		ScoreLevel:                  scoreLevelDTO.ScoreLevelVeryGood,
		AuthorCourseParticipationID: suite.testParticipantID3,
	}

	err := CreateOrUpdateEvaluation(suite.suiteCtx, suite.testCoursePhaseID, request)
	assert.NoError(suite.T(), err)

	// Verify the evaluation was created by retrieving all evaluations for this participant
	evaluations, err := GetSelfEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID3, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err)

	// Find the newly created evaluation
	found := false
	for _, evaluation := range evaluations {
		if evaluation.CompetencyID == suite.testCompetencyID1 && evaluation.ScoreLevel == scoreLevelDTO.ScoreLevelVeryGood {
			found = true
			break
		}
	}
	assert.True(suite.T(), found, "Newly created evaluation should be found")
}

// Test updating an existing evaluation
func (suite *EvaluationServiceTestSuite) TestCreateOrUpdateEvaluation_Update() {
	// First create an evaluation
	request := evaluationDTO.CreateOrUpdateEvaluationRequest{
		CourseParticipationID:       suite.testParticipantID2,
		CompetencyID:                suite.testCompetencyID3,
		ScoreLevel:                  scoreLevelDTO.ScoreLevelOk,
		AuthorCourseParticipationID: suite.testParticipantID2,
	}

	err := CreateOrUpdateEvaluation(suite.suiteCtx, suite.testCoursePhaseID, request)
	assert.NoError(suite.T(), err)

	// Now update it with a different score
	request.ScoreLevel = scoreLevelDTO.ScoreLevelVeryGood
	err = CreateOrUpdateEvaluation(suite.suiteCtx, suite.testCoursePhaseID, request)
	assert.NoError(suite.T(), err)

	// Verify the evaluation was updated
	evaluations, err := GetSelfEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID2, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err)

	// Find the updated evaluation
	found := false
	for _, evaluation := range evaluations {
		if evaluation.CompetencyID == suite.testCompetencyID3 && evaluation.ScoreLevel == scoreLevelDTO.ScoreLevelVeryGood {
			found = true
			break
		}
	}
	assert.True(suite.T(), found, "Updated evaluation should have new score level")
}

// Test deleting an evaluation
func (suite *EvaluationServiceTestSuite) TestDeleteEvaluation() {
	// Create an evaluation to delete
	request := evaluationDTO.CreateOrUpdateEvaluationRequest{
		CourseParticipationID:       suite.testParticipantID1,
		CompetencyID:                suite.testCompetencyID3,
		ScoreLevel:                  scoreLevelDTO.ScoreLevelBad,
		AuthorCourseParticipationID: suite.testParticipantID1,
	}

	err := CreateOrUpdateEvaluation(suite.suiteCtx, suite.testCoursePhaseID, request)
	assert.NoError(suite.T(), err)

	// Get the evaluation to find its ID
	evaluations, err := GetSelfEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID1, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err)

	var evaluationToDelete evaluationDTO.Evaluation
	found := false
	for _, evaluation := range evaluations {
		if evaluation.CompetencyID == suite.testCompetencyID3 && evaluation.ScoreLevel == scoreLevelDTO.ScoreLevelBad {
			evaluationToDelete = evaluation
			found = true
			break
		}
	}
	assert.True(suite.T(), found, "Evaluation to delete should be found")

	// Delete the evaluation
	err = DeleteEvaluation(suite.suiteCtx, evaluationToDelete.ID)
	assert.NoError(suite.T(), err)

	// Verify the evaluation was deleted
	_, err = GetEvaluationByID(suite.suiteCtx, evaluationToDelete.ID)
	assert.Error(suite.T(), err)
}

// Test creating a peer evaluation
func (suite *EvaluationServiceTestSuite) TestCreatePeerEvaluation() {
	request := evaluationDTO.CreateOrUpdateEvaluationRequest{
		CourseParticipationID:       suite.testParticipantID2, // Being evaluated
		CompetencyID:                suite.testCompetencyID2,
		ScoreLevel:                  scoreLevelDTO.ScoreLevelGood,
		AuthorCourseParticipationID: suite.testParticipantID3, // Different from participant (peer evaluation)
	}

	err := CreateOrUpdateEvaluation(suite.suiteCtx, suite.testCoursePhaseID, request)
	assert.NoError(suite.T(), err)

	// Verify the peer evaluation was created
	evaluations, err := GetPeerEvaluationsForParticipantInPhase(suite.suiteCtx, suite.testParticipantID2, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err)

	found := false
	for _, evaluation := range evaluations {
		if evaluation.CompetencyID == suite.testCompetencyID2 &&
			evaluation.AuthorCourseParticipationID == suite.testParticipantID3 &&
			evaluation.ScoreLevel == scoreLevelDTO.ScoreLevelGood {
			found = true
			break
		}
	}
	assert.True(suite.T(), found, "Newly created peer evaluation should be found")
}

// Test DTO mapping functionality
func (suite *EvaluationServiceTestSuite) TestDTOMapping() {
	evaluation, err := GetEvaluationByID(suite.suiteCtx, suite.existingEvaluationID1)
	assert.NoError(suite.T(), err)

	// Verify DTO fields are properly mapped
	assert.NotEqual(suite.T(), uuid.Nil, evaluation.ID)
	assert.NotEqual(suite.T(), uuid.Nil, evaluation.CourseParticipationID)
	assert.NotEqual(suite.T(), uuid.Nil, evaluation.CoursePhaseID)
	assert.NotEqual(suite.T(), uuid.Nil, evaluation.CompetencyID)
	assert.NotEqual(suite.T(), uuid.Nil, evaluation.AuthorCourseParticipationID)
	assert.NotEmpty(suite.T(), string(evaluation.ScoreLevel))
	assert.NotNil(suite.T(), evaluation.EvaluatedAt)
}

// Test mapping functions exist and work properly
func (suite *EvaluationServiceTestSuite) TestDTOMappingFunctions() {
	// Test that we can create evaluation DTOs
	evaluations := make([]evaluationDTO.Evaluation, 0)
	assert.NotNil(suite.T(), evaluations, "Evaluation slice should be created")
	assert.Equal(suite.T(), 0, len(evaluations), "Empty evaluation slice should have length 0")

	// Test that we can map empty slices
	mappedEvaluations := evaluationDTO.MapToEvaluationDTOs([]db.Evaluation{})
	assert.NotNil(suite.T(), mappedEvaluations, "Mapped evaluations should not be nil")
	assert.Equal(suite.T(), 0, len(mappedEvaluations), "Mapped empty slice should have length 0")
}
