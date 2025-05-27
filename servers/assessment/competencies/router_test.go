package competencies

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/ls1intum/prompt2/servers/assessment/competencies/competencyDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CompetencyRouterTestSuite struct {
	suite.Suite
	router            *gin.Engine
	ctx               context.Context
	cleanup           func()
	competencyService CompetencyService
}

func (suite *CompetencyRouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/competencies.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.competencyService = CompetencyService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}

	CompetencyServiceSingleton = &suite.competencyService
	suite.router = gin.Default()
	api := suite.router.Group("/api")
	testMiddleWare := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "existingstudent@example.com", "03711111", "ab12cde")
	}
	setupCompetencyRouter(api, testMiddleWare)
}

func (suite *CompetencyRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CompetencyRouterTestSuite) TestListCompetencies() {
	req, _ := http.NewRequest("GET", "/api/competency", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var competencies []competencyDTO.Competency
	err := json.Unmarshal(resp.Body.Bytes(), &competencies)
	assert.NoError(suite.T(), err)
	assert.GreaterOrEqual(suite.T(), len(competencies), 0, "Should return a list of competencies")
}

func (suite *CompetencyRouterTestSuite) TestGetCompetency() {
	// First create a competency to get
	categoryID := uuid.MustParse("25f1c984-ba31-4cf2-aa8e-5662721bf44e")
	createReq := competencyDTO.CreateCompetencyRequest{
		CategoryID:   categoryID,
		Name:         "Test Competency",
		Description:  "Test Description",
		Novice:       "Novice level description",
		Intermediate: "Intermediate level description",
		Advanced:     "Advanced level description",
		Expert:       "Expert level description",
		Weight:       10,
	}

	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/competency", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusCreated, resp.Code)

	// Get list of competencies to find the created one
	req, _ = http.NewRequest("GET", "/api/competency", nil)
	resp = httptest.NewRecorder()
	suite.router.ServeHTTP(resp, req)

	var competencies []competencyDTO.Competency
	err := json.Unmarshal(resp.Body.Bytes(), &competencies)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(competencies), 0, "Should have at least one competency")

	competencyID := competencies[0].ID

	// Now test getting the specific competency
	req, _ = http.NewRequest("GET", "/api/competency/"+competencyID.String(), nil)
	resp = httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var competency competencyDTO.Competency
	err = json.Unmarshal(resp.Body.Bytes(), &competency)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), competencyID, competency.ID)
}

func (suite *CompetencyRouterTestSuite) TestGetCompetencyInvalidID() {
	req, _ := http.NewRequest("GET", "/api/competency/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp["error"], "invalid UUID")
}

func (suite *CompetencyRouterTestSuite) TestListCompetenciesByCategory() {
	categoryID := uuid.New()

	req, _ := http.NewRequest("GET", "/api/competency/category/"+categoryID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var competencies []competencyDTO.Competency
	err := json.Unmarshal(resp.Body.Bytes(), &competencies)
	assert.NoError(suite.T(), err)
	// Should return empty list for non-existent category
	assert.Equal(suite.T(), 0, len(competencies))
}

func (suite *CompetencyRouterTestSuite) TestListCompetenciesByCategoryInvalidID() {
	req, _ := http.NewRequest("GET", "/api/competency/category/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp["error"], "invalid UUID")
}

func (suite *CompetencyRouterTestSuite) TestCreateCompetency() {
	categoryID := uuid.MustParse("25f1c984-ba31-4cf2-aa8e-5662721bf44e")
	createReq := competencyDTO.CreateCompetencyRequest{
		CategoryID:   categoryID,
		Name:         "Test Competency",
		Description:  "Test Description",
		Novice:       "Novice level description",
		Intermediate: "Intermediate level description",
		Advanced:     "Advanced level description",
		Expert:       "Expert level description",
		Weight:       10,
	}

	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/competency", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusCreated, resp.Code)
}

func (suite *CompetencyRouterTestSuite) TestCreateCompetencyInvalidJSON() {
	req, _ := http.NewRequest("POST", "/api/competency", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp, "error")
}

func (suite *CompetencyRouterTestSuite) TestUpdateCompetency() {
	// First create a competency to update
	categoryID := uuid.MustParse("25f1c984-ba31-4cf2-aa8e-5662721bf44e")
	createReq := competencyDTO.CreateCompetencyRequest{
		CategoryID:   categoryID,
		Name:         "Original Competency",
		Description:  "Original Description",
		Novice:       "Original Novice",
		Intermediate: "Original Intermediate",
		Advanced:     "Original Advanced",
		Expert:       "Original Expert",
		Weight:       5,
	}

	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/competency", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusCreated, resp.Code)

	// Get list of competencies to find the created one
	req, _ = http.NewRequest("GET", "/api/competency", nil)
	resp = httptest.NewRecorder()
	suite.router.ServeHTTP(resp, req)

	var competencies []competencyDTO.Competency
	err := json.Unmarshal(resp.Body.Bytes(), &competencies)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(competencies), 0, "Should have at least one competency")

	competencyID := competencies[0].ID

	// Now update the competency
	updateReq := competencyDTO.UpdateCompetencyRequest{
		CategoryID:   categoryID,
		Name:         "Updated Competency",
		Description:  "Updated Description",
		Novice:       "Updated Novice",
		Intermediate: "Updated Intermediate",
		Advanced:     "Updated Advanced",
		Expert:       "Updated Expert",
		Weight:       15,
	}

	body, _ = json.Marshal(updateReq)
	req, _ = http.NewRequest("PUT", "/api/competency/"+competencyID.String(), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp = httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
}

func (suite *CompetencyRouterTestSuite) TestUpdateCompetencyInvalidID() {
	updateReq := competencyDTO.UpdateCompetencyRequest{
		CategoryID:   uuid.New(),
		Name:         "Updated Competency",
		Description:  "Updated Description",
		Novice:       "Updated Novice",
		Intermediate: "Updated Intermediate",
		Advanced:     "Updated Advanced",
		Expert:       "Updated Expert",
		Weight:       15,
	}

	body, _ := json.Marshal(updateReq)
	req, _ := http.NewRequest("PUT", "/api/competency/invalid-uuid", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp["error"], "invalid UUID")
}

func (suite *CompetencyRouterTestSuite) TestUpdateCompetencyInvalidJSON() {
	competencyID := uuid.New()

	req, _ := http.NewRequest("PUT", "/api/competency/"+competencyID.String(), bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp, "error")
}

func (suite *CompetencyRouterTestSuite) TestDeleteCompetency() {
	// First create a competency to delete
	categoryID := uuid.MustParse("25f1c984-ba31-4cf2-aa8e-5662721bf44e")
	createReq := competencyDTO.CreateCompetencyRequest{
		CategoryID:   categoryID,
		Name:         "Competency to Delete",
		Description:  "Description",
		Novice:       "Novice",
		Intermediate: "Intermediate",
		Advanced:     "Advanced",
		Expert:       "Expert",
		Weight:       10,
	}

	body, _ := json.Marshal(createReq)
	req, _ := http.NewRequest("POST", "/api/competency", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusCreated, resp.Code)

	// Get list of competencies to find the created one
	req, _ = http.NewRequest("GET", "/api/competency", nil)
	resp = httptest.NewRecorder()
	suite.router.ServeHTTP(resp, req)

	var competencies []competencyDTO.Competency
	err := json.Unmarshal(resp.Body.Bytes(), &competencies)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(competencies), 0, "Should have at least one competency")

	competencyID := competencies[0].ID

	// Now delete the competency
	req, _ = http.NewRequest("DELETE", "/api/competency/"+competencyID.String(), nil)
	resp = httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
}

func (suite *CompetencyRouterTestSuite) TestDeleteCompetencyInvalidID() {
	req, _ := http.NewRequest("DELETE", "/api/competency/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)

	var errorResp map[string]string
	err := json.Unmarshal(resp.Body.Bytes(), &errorResp)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), errorResp["error"], "invalid UUID")
}

func TestCompetencyRouterTestSuite(t *testing.T) {
	suite.Run(t, new(CompetencyRouterTestSuite))
}
