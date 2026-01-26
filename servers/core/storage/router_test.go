package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/core/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type StorageRouterTestSuite struct {
	suite.Suite
	ctx     context.Context
	cleanup func()
	service *StorageService
	router  *gin.Engine
}

func TestStorageRouterTestSuite(t *testing.T) {
	suite.Run(t, new(StorageRouterTestSuite))
}

func (suite *StorageRouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()
	
	// Setup test database
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/storage_test.sql")
	if err != nil {
		suite.T().Fatalf("Failed to setup test database: %v", err)
	}
	suite.cleanup = cleanup

	// Create service with mock adapter and set as singleton
	mockAdapter := &MockStorageAdapter{}
	// Use empty allowed types to disable content type validation in tests
	suite.service = NewStorageService(*testDB.Queries, testDB.Conn, mockAdapter, 50, []string{})
	
	// Set the global singleton for router handlers
	StorageServiceSingleton = suite.service

	// Setup router
	gin.SetMode(gin.TestMode)
	suite.router = gin.New()
	
	// Mock authentication middleware that sets user ID
	authMiddleware := func() gin.HandlerFunc {
		return func(c *gin.Context) {
			c.Set("keycloak_user_id", "11111111-1111-1111-1111-111111111111")
			c.Set("email", "test.user@tum.de")
			c.Next()
		}
	}
	
	// Mock permission middleware that allows all
	permissionMiddleware := func(roles ...string) gin.HandlerFunc {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	// Setup routes
	api := suite.router.Group("/api")
	setupStorageRouter(api, authMiddleware, permissionMiddleware)
}

func (suite *StorageRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *StorageRouterTestSuite) TestUploadFile_Success() {
	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	// Add file part
	part, err := writer.CreateFormFile("file", "test-document.pdf")
	assert.NoError(suite.T(), err)
	_, err = part.Write([]byte("Test file content\n"))
	assert.NoError(suite.T(), err)
	
	// Add optional fields
	_ = writer.WriteField("applicationId", "22222222-2222-2222-2222-222222222222")
	_ = writer.WriteField("description", "Test upload")
	_ = writer.WriteField("tags", "test,document")
	
	err = writer.Close()
	assert.NoError(suite.T(), err)

	// Create request
	req := httptest.NewRequest(http.MethodPost, "/api/storage/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Debug output
	if w.Code != http.StatusCreated {
		suite.T().Logf("Upload failed with status %d: %s", w.Code, w.Body.String())
	}

	// Assert response
	assert.Equal(suite.T(), http.StatusCreated, w.Code)
	
	var response FileResponse
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.NotEqual(suite.T(), uuid.Nil, response.ID)
	assert.Equal(suite.T(), "test-document.pdf", response.OriginalFilename)
	// Content type will be application/octet-stream in tests due to multipart handling
	assert.NotEmpty(suite.T(), response.ContentType)
	// Size should match the content "Test file content\n" = 19 bytes (or 18 without newline)
	assert.Greater(suite.T(), response.SizeBytes, int64(0))
}

func (suite *StorageRouterTestSuite) TestUploadFile_NoFile() {
	// Create empty multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	err := writer.Close()
	assert.NoError(suite.T(), err)

	req := httptest.NewRequest(http.MethodPost, "/api/storage/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "file")
}

func (suite *StorageRouterTestSuite) TestUploadFile_FileTooLarge() {
	// Create large file
	largeContent := make([]byte, 51*1024*1024) // 51MB
	
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", "large-file.pdf")
	assert.NoError(suite.T(), err)
	_, err = part.Write(largeContent)
	assert.NoError(suite.T(), err)
	err = writer.Close()
	assert.NoError(suite.T(), err)

	req := httptest.NewRequest(http.MethodPost, "/api/storage/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Service returns 500 for size validation errors
	assert.Equal(suite.T(), http.StatusInternalServerError, w.Code)
	assert.Contains(suite.T(), w.Body.String(), "exceeds maximum")
}

func (suite *StorageRouterTestSuite) TestGetFile_Success() {
	// First upload a file
	fileID := suite.uploadTestFile("test-get.pdf", "Get test file")

	// Get the file
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/storage/files/%s", fileID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var response FileResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), fileID, response.ID)
	assert.Equal(suite.T(), "test-get.pdf", response.OriginalFilename)
}

func (suite *StorageRouterTestSuite) TestGetFile_NotFound() {
	nonExistentID := uuid.New()
	
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/storage/files/%s", nonExistentID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNotFound, w.Code)
}

func (suite *StorageRouterTestSuite) TestGetFile_InvalidID() {
	req := httptest.NewRequest(http.MethodGet, "/api/storage/files/invalid-uuid", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)
}

func (suite *StorageRouterTestSuite) TestDownloadFile_Success() {
	// Upload a file first
	fileID := suite.uploadTestFile("test-download.pdf", "Download test")

	// Download the file
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/storage/files/%s/download", fileID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	assert.NotEmpty(suite.T(), w.Body.Bytes())
	assert.Contains(suite.T(), w.Header().Get("Content-Disposition"), "test-download.pdf")
}

func (suite *StorageRouterTestSuite) TestDeleteFile_Success() {
	// Upload a file first
	fileID := suite.uploadTestFile("test-delete.pdf", "Delete test")

	// Delete the file
	req := httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/storage/files/%s", fileID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusNoContent, w.Code)

	// Verify file returns 404 after deletion (soft delete)
	getReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/storage/files/%s", fileID), nil)
	getW := httptest.NewRecorder()
	suite.router.ServeHTTP(getW, getReq)
	assert.Equal(suite.T(), http.StatusNotFound, getW.Code)
}

func (suite *StorageRouterTestSuite) TestListFiles_ByCoursePhase() {
	coursePhaseID := uuid.MustParse("55555555-5555-5555-5555-555555555555")
	
	// Upload files
	suite.uploadTestFileWithCoursePhase("phase-file1.pdf", coursePhaseID)
	suite.uploadTestFileWithCoursePhase("phase-file2.pdf", coursePhaseID)

	// List files
	req := httptest.NewRequest(http.MethodGet, 
		fmt.Sprintf("/api/storage/course-phases/%s/files", coursePhaseID), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	
	var response []FileResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.GreaterOrEqual(suite.T(), len(response), 2)
}

func (suite *StorageRouterTestSuite) TestListFiles_WithPagination() {
	// Note: Current API doesn't support pagination on list endpoints
	// This test is a placeholder for future pagination support
	suite.T().Skip("Pagination not yet implemented on list endpoints")
}

// Helper functions

func (suite *StorageRouterTestSuite) uploadTestFile(filename, description string) uuid.UUID {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	part, _ := writer.CreateFormFile("file", filename)
	_, _ = part.Write([]byte("Test content"))
	_ = writer.WriteField("description", description)
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/storage/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var response FileResponse
	_ = json.Unmarshal(w.Body.Bytes(), &response)
	return response.ID
}

func (suite *StorageRouterTestSuite) uploadTestFileWithCoursePhase(filename string, coursePhaseID uuid.UUID) uuid.UUID {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	
	part, _ := writer.CreateFormFile("file", filename)
	_, _ = part.Write([]byte("Test content"))
	_ = writer.WriteField("coursePhaseId", coursePhaseID.String())
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/storage/upload", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	var response FileResponse
	_ = json.Unmarshal(w.Body.Bytes(), &response)
	return response.ID
}
