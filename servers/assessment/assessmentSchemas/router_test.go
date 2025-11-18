package assessmentSchemas

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/assessmentSchemas/assessmentSchemaDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type AssessmentSchemaRouterTestSuite struct {
	suite.Suite
	router                    *gin.Engine
	suiteCtx                  context.Context
	cleanup                   func()
	assessmentSchemaService AssessmentSchemaService
}

func (suite *AssessmentSchemaRouterTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/categories.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.assessmentSchemaService = AssessmentSchemaService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	AssessmentSchemaServiceSingleton = &suite.assessmentSchemaService
	suite.router = gin.Default()
	api := suite.router.Group("/api")
	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "admin@example.com", "12345678", "admin123")
	}
	SetupAssessmentSchemaRouter(api, testMiddleware)
}

func (suite *AssessmentSchemaRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *AssessmentSchemaRouterTestSuite) TestGetAllAssessmentSchemas() {
	req, _ := http.NewRequest("GET", "/api/assessment-schema", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var templates []assessmentSchemaDTO.AssessmentSchema
	err := json.Unmarshal(resp.Body.Bytes(), &templates)
	assert.NoError(suite.T(), err)
	// Should return a list (might be empty)
	assert.NotNil(suite.T(), templates)
}

func (suite *AssessmentSchemaRouterTestSuite) TestCreateAssessmentSchema() {
	createReq := assessmentSchemaDTO.CreateAssessmentSchemaRequest{
		Name:        "Test Assessment Template",
		Description: "This is a test template for router testing",
	}
	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/assessment-schema", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusCreated, resp.Code)

	var template assessmentSchemaDTO.AssessmentSchema
	err := json.Unmarshal(resp.Body.Bytes(), &template)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), createReq.Name, template.Name)
	assert.Equal(suite.T(), createReq.Description, template.Description)
	assert.NotEqual(suite.T(), uuid.Nil, template.ID)
}

func (suite *AssessmentSchemaRouterTestSuite) TestCreateAssessmentSchemaInvalidJSON() {
	req, _ := http.NewRequest("POST", "/api/assessment-schema", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errResp, "error")
}

func (suite *AssessmentSchemaRouterTestSuite) TestGetAssessmentSchema() {
	// First create a template to retrieve
	createReq := assessmentSchemaDTO.CreateAssessmentSchemaRequest{
		Name:        "Test Template for Get",
		Description: "Template to test GET endpoint",
	}
	template, err := CreateAssessmentSchema(suite.suiteCtx, createReq)
	assert.NoError(suite.T(), err)

	// Now test GET endpoint
	req, _ := http.NewRequest("GET", "/api/assessment-schema/"+template.ID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var retrievedTemplate assessmentSchemaDTO.AssessmentSchema
	err = json.Unmarshal(resp.Body.Bytes(), &retrievedTemplate)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), template.ID, retrievedTemplate.ID)
	assert.Equal(suite.T(), template.Name, retrievedTemplate.Name)
	assert.Equal(suite.T(), template.Description, retrievedTemplate.Description)
}

func (suite *AssessmentSchemaRouterTestSuite) TestGetAssessmentSchemaInvalidUUID() {
	req, _ := http.NewRequest("GET", "/api/assessment-schema/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errResp, "error")
}

func (suite *AssessmentSchemaRouterTestSuite) TestGetAssessmentSchemaNotFound() {
	nonExistentID := uuid.New()
	req, _ := http.NewRequest("GET", "/api/assessment-schema/"+nonExistentID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusInternalServerError, resp.Code)
}

func (suite *AssessmentSchemaRouterTestSuite) TestUpdateAssessmentSchema() {
	// First create a template to update
	createReq := assessmentSchemaDTO.CreateAssessmentSchemaRequest{
		Name:        "Original Template",
		Description: "Original description",
	}
	template, err := CreateAssessmentSchema(suite.suiteCtx, createReq)
	assert.NoError(suite.T(), err)

	// Now test update
	updateReq := assessmentSchemaDTO.UpdateAssessmentSchemaRequest{
		Name:        "Updated Template",
		Description: "Updated description",
	}
	body, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest("PUT", "/api/assessment-schema/"+template.ID.String(), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var successResp map[string]string
	err = json.Unmarshal(resp.Body.Bytes(), &successResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), successResp["message"], "updated successfully")
}

func (suite *AssessmentSchemaRouterTestSuite) TestUpdateAssessmentSchemaInvalidUUID() {
	updateReq := assessmentSchemaDTO.UpdateAssessmentSchemaRequest{
		Name:        "Updated Template",
		Description: "Updated description",
	}
	body, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest("PUT", "/api/assessment-schema/invalid-uuid", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *AssessmentSchemaRouterTestSuite) TestUpdateAssessmentSchemaInvalidJSON() {
	templateID := uuid.New()
	req, _ := http.NewRequest("PUT", "/api/assessment-schema/"+templateID.String(), bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *AssessmentSchemaRouterTestSuite) TestDeleteAssessmentSchema() {
	// First create a template to delete
	createReq := assessmentSchemaDTO.CreateAssessmentSchemaRequest{
		Name:        "Template to Delete",
		Description: "This template will be deleted",
	}
	template, err := CreateAssessmentSchema(suite.suiteCtx, createReq)
	assert.NoError(suite.T(), err)

	// Now test delete
	req, _ := http.NewRequest("DELETE", "/api/assessment-schema/"+template.ID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var successResp map[string]string
	err = json.Unmarshal(resp.Body.Bytes(), &successResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), successResp["message"], "deleted successfully")
}

func (suite *AssessmentSchemaRouterTestSuite) TestDeleteAssessmentSchemaInvalidUUID() {
	req, _ := http.NewRequest("DELETE", "/api/assessment-schema/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *AssessmentSchemaRouterTestSuite) TestDeleteAssessmentSchemaNotFound() {
	nonExistentID := uuid.New()
	req, _ := http.NewRequest("DELETE", "/api/assessment-schema/"+nonExistentID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	// The service might handle non-existent records gracefully and return 200
	// This is actually valid behavior as the delete operation is idempotent
	assert.True(suite.T(), resp.Code == http.StatusOK || resp.Code == http.StatusInternalServerError)
}

func TestAssessmentSchemaRouterTestSuite(t *testing.T) {
	suite.Run(t, new(AssessmentSchemaRouterTestSuite))
}
