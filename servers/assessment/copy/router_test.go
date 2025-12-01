package copy

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	promptTypes "github.com/ls1intum/prompt-sdk/promptTypes"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CopyRouterTestSuite struct {
	suite.Suite
	router      *gin.Engine
	suiteCtx    context.Context
	cleanup     func()
	copyService CopyService
}

func (suite *CopyRouterTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/coursePhaseConfig.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.copyService = CopyService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CopyServiceSingleton = &suite.copyService
	suite.router = gin.Default()
	api := suite.router.Group("/api")
	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "lecturer@example.com", "03711111", "ab12cde")
	}
	setupCopyRouter(api, testMiddleware)
}

func (suite *CopyRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CopyRouterTestSuite) TestCopyEndpoint_Success() {
	// Create source course phase config
	sourceCoursePhaseID := uuid.New()
	targetCoursePhaseID := uuid.New()
	assessmentSchemaID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")
	selfEvalSchemaID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440001")

	// Create source config
	err := suite.copyService.queries.CreateOrUpdateCoursePhaseConfig(suite.suiteCtx, db.CreateOrUpdateCoursePhaseConfigParams{
		AssessmentSchemaID:       assessmentSchemaID,
		CoursePhaseID:            sourceCoursePhaseID,
		Start:                    pgtype.Timestamptz{Valid: false},
		Deadline:                 pgtype.Timestamptz{Valid: false},
		SelfEvaluationEnabled:    true,
		SelfEvaluationSchema:     selfEvalSchemaID,
		SelfEvaluationStart:      pgtype.Timestamptz{Valid: false},
		SelfEvaluationDeadline:   pgtype.Timestamptz{Valid: false},
		PeerEvaluationEnabled:    false,
		PeerEvaluationSchema:     uuid.Nil,
		PeerEvaluationStart:      pgtype.Timestamptz{Valid: false},
		PeerEvaluationDeadline:   pgtype.Timestamptz{Valid: false},
		TutorEvaluationEnabled:   false,
		TutorEvaluationSchema:    uuid.Nil,
		TutorEvaluationStart:     pgtype.Timestamptz{Valid: false},
		TutorEvaluationDeadline:  pgtype.Timestamptz{Valid: false},
		EvaluationResultsVisible: true,
		GradeSuggestionVisible:   pgtype.Bool{Bool: true, Valid: true},
		ActionItemsVisible:       pgtype.Bool{Bool: true, Valid: true},
	})
	assert.NoError(suite.T(), err)

	// Create request
	copyReq := promptTypes.PhaseCopyRequest{
		SourceCoursePhaseID: sourceCoursePhaseID,
		TargetCoursePhaseID: targetCoursePhaseID,
	}
	body, _ := json.Marshal(copyReq)
	req, _ := http.NewRequest("POST", "/api/copy", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	// Verify the target config was created
	targetConfig, err := suite.copyService.queries.GetCoursePhaseConfig(suite.suiteCtx, targetCoursePhaseID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), assessmentSchemaID, targetConfig.AssessmentSchemaID)
	assert.Equal(suite.T(), targetCoursePhaseID, targetConfig.CoursePhaseID)
	assert.Equal(suite.T(), true, targetConfig.SelfEvaluationEnabled)
	assert.Equal(suite.T(), selfEvalSchemaID, targetConfig.SelfEvaluationSchema)
}

func (suite *CopyRouterTestSuite) TestCopyEndpoint_InvalidJSON() {
	req, _ := http.NewRequest("POST", "/api/copy", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *CopyRouterTestSuite) TestCopyEndpoint_SameSourceAndTarget() {
	coursePhaseID := uuid.New()

	copyReq := promptTypes.PhaseCopyRequest{
		SourceCoursePhaseID: coursePhaseID,
		TargetCoursePhaseID: coursePhaseID,
	}
	body, _ := json.Marshal(copyReq)
	req, _ := http.NewRequest("POST", "/api/copy", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code, "Should succeed when source and target are the same")
}

func (suite *CopyRouterTestSuite) TestCopyEndpoint_NonExistentSource() {
	nonExistentSourceID := uuid.New()
	targetCoursePhaseID := uuid.New()

	copyReq := promptTypes.PhaseCopyRequest{
		SourceCoursePhaseID: nonExistentSourceID,
		TargetCoursePhaseID: targetCoursePhaseID,
	}
	body, _ := json.Marshal(copyReq)
	req, _ := http.NewRequest("POST", "/api/copy", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, resp.Code, "Should fail when source doesn't exist")
}

func TestCopyRouterTestSuite(t *testing.T) {
	suite.Run(t, new(CopyRouterTestSuite))
}
