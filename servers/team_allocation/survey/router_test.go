package survey

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/team_allocation/survey/surveyDTO"
	"github.com/ls1intum/prompt2/servers/team_allocation/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type SurveyRouterTestSuite struct {
	suite.Suite
	router        *gin.Engine
	suiteCtx      context.Context
	cleanup       func()
	surveyService SurveyService
}

func (suite *SurveyRouterTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/complete_schema.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.surveyService = SurveyService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	SurveyServiceSingleton = &suite.surveyService
	suite.router = gin.Default()
	api := suite.router.Group("/api/course_phase/:coursePhaseID")
	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "student@example.com", "03711111", "ab12cde")
	}
	setupSurveyRouter(api, testMiddleware)
}

func (suite *SurveyRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *SurveyRouterTestSuite) TestGetSurveyForm() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"
	req, _ := http.NewRequest("GET", "/api/course_phase/"+coursePhaseID+"/survey/form", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var surveyForm surveyDTO.SurveyForm
	err := json.Unmarshal(resp.Body.Bytes(), &surveyForm)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(surveyForm.Teams), 0, "Should return teams")
	assert.GreaterOrEqual(suite.T(), len(surveyForm.Skills), 0, "Should return skills")
}

func (suite *SurveyRouterTestSuite) TestGetSurveyFormInvalidCoursePhaseID() {
	req, _ := http.NewRequest("GET", "/api/course_phase/invalid-uuid/survey/form", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *SurveyRouterTestSuite) TestSubmitSurveyResponse() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"

	surveyResponse := surveyDTO.StudentSurveyResponse{
		TeamPreferences: []surveyDTO.StudentTeamPreferenceResponse{
			{
				TeamID:     uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
				Preference: 1,
			},
			{
				TeamID:     uuid.MustParse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
				Preference: 2,
			},
			{
				TeamID:     uuid.MustParse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
				Preference: 3,
			},
		},
		SkillResponses: []surveyDTO.StudentSkillResponse{
			{
				SkillID:    uuid.MustParse("11111111-1111-1111-1111-111111111111"),
				SkillLevel: db.SkillLevelIntermediate,
			},
			{
				SkillID:    uuid.MustParse("22222222-2222-2222-2222-222222222222"),
				SkillLevel: db.SkillLevelAdvanced,
			},
			{
				SkillID:    uuid.MustParse("33333333-3333-3333-3333-333333333333"),
				SkillLevel: db.SkillLevelNovice,
			},
			{
				SkillID:    uuid.MustParse("44444444-4444-4444-4444-444444444444"),
				SkillLevel: db.SkillLevelExpert,
			},
		},
	}

	body, _ := json.Marshal(surveyResponse)
	req, _ := http.NewRequest("POST", "/api/course_phase/"+coursePhaseID+"/survey/answers", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
}

func (suite *SurveyRouterTestSuite) TestSubmitSurveyResponseInvalidJSON() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"
	req, _ := http.NewRequest("POST", "/api/course_phase/"+coursePhaseID+"/survey/answers", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *SurveyRouterTestSuite) TestSetSurveyTimeframe() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"

	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "lecturer@example.com", "03711111", "ab12cde")
	}

	// Re-setup router with lecturer middleware
	suite.router = gin.Default()
	api := suite.router.Group("/api/course_phase/:coursePhaseID")
	setupSurveyRouter(api, testMiddleware)

	timeframeReq := surveyDTO.SurveyTimeframe{
		SurveyStart:    time.Date(2025, 1, 1, 10, 0, 0, 0, time.UTC),
		SurveyDeadline: time.Date(2030, 12, 31, 23, 59, 59, 0, time.UTC),
	}

	body, _ := json.Marshal(timeframeReq)
	req, _ := http.NewRequest("PUT", "/api/course_phase/"+coursePhaseID+"/survey/timeframe", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
}

func TestSurveyRouterTestSuite(t *testing.T) {
	suite.Run(t, new(SurveyRouterTestSuite))
}
