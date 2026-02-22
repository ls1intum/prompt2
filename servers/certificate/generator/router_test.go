package generator

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/certificate/config"
	db "github.com/ls1intum/prompt2/servers/certificate/db/sqlc"
	"github.com/ls1intum/prompt2/servers/certificate/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type GeneratorRouterTestSuite struct {
	suite.Suite
	router          *gin.Engine
	suiteCtx        context.Context
	cleanup         func()
	mockCoreCleanup func()
}

func (s *GeneratorRouterTestSuite) SetupSuite() {
	s.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(s.suiteCtx, "../database_dumps/certificate.sql")
	if err != nil {
		s.T().Fatalf("Failed to set up test database: %v", err)
	}
	s.cleanup = cleanup

	_, mockCoreCleanup := testutils.SetupMockCoreService()
	s.mockCoreCleanup = mockCoreCleanup

	// Initialize config service singleton (needed by generator)
	config.ConfigServiceSingleton = config.NewConfigService(*testDB.Queries, testDB.Conn)

	GeneratorServiceSingleton = &GeneratorService{
		queries: *testDB.Queries,
	}

	gin.SetMode(gin.TestMode)
	s.router = gin.Default()
	api := s.router.Group("/api/course_phase/:coursePhaseID")
	setupGeneratorRouter(api, testutils.MockPermissionMiddleware)
}

func (s *GeneratorRouterTestSuite) TearDownSuite() {
	if s.mockCoreCleanup != nil {
		s.mockCoreCleanup()
	}
	if s.cleanup != nil {
		s.cleanup()
	}
}

func (s *GeneratorRouterTestSuite) TestDownloadStudentCertificate_InvalidCoursePhaseID() {
	url := "/api/course_phase/not-a-uuid/certificate/download/30000000-0000-0000-0000-000000000001"

	req, _ := http.NewRequest("GET", url, nil)
	resp := httptest.NewRecorder()
	s.router.ServeHTTP(resp, req)

	assert.Equal(s.T(), http.StatusBadRequest, resp.Code)
}

func (s *GeneratorRouterTestSuite) TestDownloadStudentCertificate_InvalidStudentID() {
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000001")
	url := fmt.Sprintf("/api/course_phase/%s/certificate/download/not-a-uuid", coursePhaseID)

	req, _ := http.NewRequest("GET", url, nil)
	resp := httptest.NewRecorder()
	s.router.ServeHTTP(resp, req)

	assert.Equal(s.T(), http.StatusBadRequest, resp.Code)
}

func (s *GeneratorRouterTestSuite) TestGetCertificateStatus_InvalidCoursePhaseID() {
	url := "/api/course_phase/not-a-uuid/certificate/status"

	req, _ := http.NewRequest("GET", url, nil)
	resp := httptest.NewRecorder()
	s.router.ServeHTTP(resp, req)

	assert.Equal(s.T(), http.StatusBadRequest, resp.Code)
}

func (s *GeneratorRouterTestSuite) TestGetTemplateStatus_WithTemplate() {
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000001")

	hasTemplate, err := getTemplateStatus(s.newGinContext(), coursePhaseID)
	assert.NoError(s.T(), err)
	assert.True(s.T(), hasTemplate)
}

func (s *GeneratorRouterTestSuite) TestGetTemplateStatus_WithoutTemplate() {
	// Phase 2 exists but has NULL template
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000002")

	_, err := getTemplateStatus(s.newGinContext(), coursePhaseID)
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "no template configured")
}

func (s *GeneratorRouterTestSuite) TestGetTemplateStatus_NonExistent() {
	nonExistentID := uuid.New()

	_, err := getTemplateStatus(s.newGinContext(), nonExistentID)
	assert.Error(s.T(), err)
}

func (s *GeneratorRouterTestSuite) TestRecordCertificateDownload_Upsert() {
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000001")
	studentID := uuid.New()

	// First download
	d1, err := GeneratorServiceSingleton.queries.RecordCertificateDownload(s.suiteCtx, db.RecordCertificateDownloadParams{
		StudentID:     studentID,
		CoursePhaseID: coursePhaseID,
	})
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), int32(1), d1.DownloadCount)

	// Second download increments
	d2, err := GeneratorServiceSingleton.queries.RecordCertificateDownload(s.suiteCtx, db.RecordCertificateDownloadParams{
		StudentID:     studentID,
		CoursePhaseID: coursePhaseID,
	})
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), int32(2), d2.DownloadCount)
}

func (s *GeneratorRouterTestSuite) TestGetCertificateDownload_ExistingRecord() {
	studentID := uuid.MustParse("30000000-0000-0000-0000-000000000001")
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000001")

	download, err := GeneratorServiceSingleton.queries.GetCertificateDownload(s.suiteCtx, db.GetCertificateDownloadParams{
		StudentID:     studentID,
		CoursePhaseID: coursePhaseID,
	})
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), int32(3), download.DownloadCount)
}

func (s *GeneratorRouterTestSuite) TestCertificateStatusEndpoint_NoTemplate() {
	// Use a phase that has no template configured
	newPhaseID := uuid.New()

	// We need to mock keycloak token user - since we use MockPermissionMiddleware
	// which doesn't set the token user, this will return 401
	url := fmt.Sprintf("/api/course_phase/%s/certificate/status", newPhaseID)
	req, _ := http.NewRequest("GET", url, nil)
	resp := httptest.NewRecorder()
	s.router.ServeHTTP(resp, req)

	// Without a mocked token user, it returns 401
	assert.Equal(s.T(), http.StatusUnauthorized, resp.Code)
}

// newGinContext creates a minimal gin.Context for unit-testing service functions.
func (s *GeneratorRouterTestSuite) newGinContext() *gin.Context {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	return c
}

// Verify JSON error response helper
func assertJSONError(t *testing.T, body []byte) {
	var result map[string]interface{}
	err := json.Unmarshal(body, &result)
	assert.NoError(t, err)
	_, hasError := result["error"]
	assert.True(t, hasError, "Response should contain an error field")
}

func TestGeneratorRouterTestSuite(t *testing.T) {
	suite.Run(t, new(GeneratorRouterTestSuite))
}
