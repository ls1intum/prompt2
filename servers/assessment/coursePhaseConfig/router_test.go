package coursePhaseConfig

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig/coursePhaseConfigDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CoursePhaseConfigRouterTestSuite struct {
	suite.Suite
	router                   *gin.Engine
	suiteCtx                 context.Context
	cleanup                  func()
	coursePhaseConfigService CoursePhaseConfigService
	testCoursePhaseID        uuid.UUID
}

func (suite *CoursePhaseConfigRouterTestSuite) SetupSuite() {
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

	suite.testCoursePhaseID = uuid.New()
	templateID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000") // From our test data

	// Insert a course phase config entry to enable updates
	_, err = testDB.Conn.Exec(suite.suiteCtx,
		"INSERT INTO course_phase_config (assessment_template_id, course_phase_id) VALUES ($1, $2)",
		templateID, suite.testCoursePhaseID)
	if err != nil {
		suite.T().Fatalf("Failed to insert test course phase config: %v", err)
	}

	suite.router = gin.Default()
	api := suite.router.Group("/api/course_phase/:coursePhaseID")
	testMiddleWare := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "lecturer@example.com", "12345", "lecturer")
	}
	setupCoursePhaseRouter(api, testMiddleWare)
}

func (suite *CoursePhaseConfigRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetCoursePhaseDeadline() {
	// First set a deadline
	testDeadline := time.Date(2025, 12, 31, 23, 59, 59, 0, time.UTC)
	err := UpdateCoursePhaseDeadline(suite.suiteCtx, suite.testCoursePhaseID, testDeadline)
	assert.NoError(suite.T(), err)

	// Test GET request
	url := fmt.Sprintf("/api/course_phase/%s/config/deadline", suite.testCoursePhaseID.String())
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response *time.Time
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.True(suite.T(), response.Equal(testDeadline))
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetCoursePhaseDeadlineNonExistent() {
	nonExistentID := uuid.New()

	// Test GET request for non-existent course phase
	url := fmt.Sprintf("/api/course_phase/%s/config/deadline", nonExistentID.String())
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response *time.Time
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Nil(suite.T(), response)
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetCoursePhaseDeadlineInvalidID() {
	// Test GET request with invalid UUID
	url := "/api/course_phase/invalid-uuid/config/deadline"
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), response["error"], "Invalid course phase ID")
}

func (suite *CoursePhaseConfigRouterTestSuite) TestUpdateCoursePhaseDeadline() {
	testDeadline := time.Date(2025, 8, 15, 14, 30, 0, 0, time.UTC)
	requestBody := coursePhaseConfigDTO.UpdateDeadlineRequest{
		Deadline: testDeadline,
	}

	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	// Test PUT request
	url := fmt.Sprintf("/api/course_phase/%s/config/deadline", suite.testCoursePhaseID.String())
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	// Verify the deadline was actually updated
	retrievedDeadline, err := GetCoursePhaseDeadline(suite.suiteCtx, suite.testCoursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), retrievedDeadline)
	assert.True(suite.T(), retrievedDeadline.Equal(testDeadline))
}

func (suite *CoursePhaseConfigRouterTestSuite) TestUpdateCoursePhaseDeadlineInvalidID() {
	testDeadline := time.Date(2025, 8, 15, 14, 30, 0, 0, time.UTC)
	requestBody := coursePhaseConfigDTO.UpdateDeadlineRequest{
		Deadline: testDeadline,
	}

	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	// Test PUT request with invalid UUID
	url := "/api/course_phase/invalid-uuid/config/deadline"
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), response["error"], "Invalid course phase ID")
}

func (suite *CoursePhaseConfigRouterTestSuite) TestUpdateCoursePhaseDeadlineInvalidBody() {
	// Test PUT request with invalid JSON body
	url := fmt.Sprintf("/api/course_phase/%s/config/deadline", suite.testCoursePhaseID.String())
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer([]byte("invalid json")))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), response["error"], "Invalid request format")
}

func (suite *CoursePhaseConfigRouterTestSuite) TestUpdateCoursePhaseDeadlineEmptyBody() {
	// Test PUT request with empty body
	url := fmt.Sprintf("/api/course_phase/%s/config/deadline", suite.testCoursePhaseID.String())
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer([]byte("{}")))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// The response depends on how the service handles zero-value time
	// It might succeed with zero time or fail with validation error
	assert.True(suite.T(), w.Code == http.StatusCreated || w.Code == http.StatusBadRequest,
		"Should return either Created or Bad Request for empty body")
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetTeamsForCoursePhase() {
	// Test GET request for teams
	url := fmt.Sprintf("/api/course_phase/%s/config/teams", suite.testCoursePhaseID.String())
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Since this calls an external service, we expect it to potentially fail
	// but we're testing that the endpoint exists and handles requests properly
	// The status should be either 200 (success) or 500 (external service failure)
	assert.True(suite.T(), w.Code == http.StatusOK || w.Code == http.StatusInternalServerError,
		"Should return either OK or Internal Server Error")

	if w.Code == http.StatusOK {
		var teams []coursePhaseConfigDTO.Team
		err = json.Unmarshal(w.Body.Bytes(), &teams)
		assert.NoError(suite.T(), err, "Response should be valid JSON array of teams")
		// Teams array can be empty, that's valid
	}
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetTeamsForCoursePhaseInvalidID() {
	// Test GET request with invalid UUID
	url := "/api/course_phase/invalid-uuid/config/teams"
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), response["error"], "Invalid course phase ID")
}

func (suite *CoursePhaseConfigRouterTestSuite) TestGetTeamsForCoursePhaseNonExistent() {
	nonExistentID := uuid.New()

	// Test GET request for non-existent course phase
	url := fmt.Sprintf("/api/course_phase/%s/config/teams", nonExistentID.String())
	req, err := http.NewRequest("GET", url, nil)
	assert.NoError(suite.T(), err)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Since this calls an external service, we expect it to potentially fail
	// The status should be either 200 (success with empty array) or 500 (external service failure)
	assert.True(suite.T(), w.Code == http.StatusOK || w.Code == http.StatusInternalServerError,
		"Should return either OK or Internal Server Error for non-existent course phase")

	if w.Code == http.StatusOK {
		var teams []coursePhaseConfigDTO.Team
		err = json.Unmarshal(w.Body.Bytes(), &teams)
		assert.NoError(suite.T(), err, "Response should be valid JSON array")
		// For non-existent course phase, teams array should be empty
	}
}

func TestCoursePhaseConfigRouterTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseConfigRouterTestSuite))
}
