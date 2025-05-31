package assessmentCompletion

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	dto "github.com/ls1intum/prompt2/servers/assessment/assessments/assessmentCompletion/assessmentCompletionDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type AssessmentCompletionRouterTestSuite struct {
	suite.Suite
	router   *gin.Engine
	suiteCtx context.Context
	cleanup  func()
	service  AssessmentCompletionService
}

func (suite *AssessmentCompletionRouterTestSuite) SetupSuite() {
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

	suite.router = gin.Default()
	api := suite.router.Group("/api/course_phase/:coursePhaseID")
	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "user@example.com", "1234", "id")
	}
	// attach routes
	setupAssessmentCompletionRouter(api, testMiddleware)
}

func (suite *AssessmentCompletionRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *AssessmentCompletionRouterTestSuite) TestMarkAssessmentInvalidJSON() {
	phaseID := uuid.New()
	req, _ := http.NewRequest("POST", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *AssessmentCompletionRouterTestSuite) TestMarkAssessmentAsCompletedReturnsError() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.MustParse("ca42e447-60f9-4fe0-b297-2dae3f924fd7")
	// minimal JSON to bind
	payload := dto.AssessmentCompletion{
		CoursePhaseID:         phaseID,
		CourseParticipationID: partID,
		Author:                "tester",
	}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	// service returns error when assessments remain
	assert.Equal(suite.T(), http.StatusInternalServerError, resp.Code)
}

func (suite *AssessmentCompletionRouterTestSuite) TestGetAssessmentCompletionNotFound() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.New()
	req, _ := http.NewRequest("GET", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed/course-participation/"+partID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusInternalServerError, resp.Code)
}

func (suite *AssessmentCompletionRouterTestSuite) TestGetAssessmentCompletionInvalidIDs() {
	// invalid phase
	req1, _ := http.NewRequest("GET", "/api/course_phase/invalid-phase/student-assessment/completed/course-participation/"+uuid.New().String(), nil)
	rep1 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep1, req1)
	assert.Equal(suite.T(), http.StatusBadRequest, rep1.Code)

	// invalid participation
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	req2, _ := http.NewRequest("GET", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed/course-participation/invalid-uuid", nil)
	rep2 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep2, req2)
	assert.Equal(suite.T(), http.StatusBadRequest, rep2.Code)
}

func (suite *AssessmentCompletionRouterTestSuite) TestUnmarkAssessmentAsCompletedNonExisting() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.New()
	req, _ := http.NewRequest("DELETE", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed/course-participation/"+partID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusOK, resp.Code)
}

func (suite *AssessmentCompletionRouterTestSuite) TestUnmarkAssessmentAsCompletedInvalidIDs() {
	// invalid phase
	req1, _ := http.NewRequest("DELETE", "/api/course_phase/invalid-phase/student-assessment/completed/course-participation/"+uuid.New().String(), nil)
	rep1 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep1, req1)
	assert.Equal(suite.T(), http.StatusBadRequest, rep1.Code)

	// invalid participation
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	req2, _ := http.NewRequest("DELETE", "/api/course_phase/"+phaseID.String()+"/student-assessment/completed/course-participation/invalid-uuid", nil)
	rep2 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep2, req2)
	assert.Equal(suite.T(), http.StatusBadRequest, rep2.Code)
}

func TestAssessmentCompletionRouterTestSuite(t *testing.T) {
	suite.Run(t, new(AssessmentCompletionRouterTestSuite))
}
