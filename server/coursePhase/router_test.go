package coursePhase

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type RouterTestSuite struct {
	suite.Suite
	router             *gin.Engine
	ctx                context.Context
	cleanup            func()
	coursePhaseService CoursePhaseService
}

func (suite *RouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/course_phase_test.sql")
	if err != nil {
		log.Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.coursePhaseService = CoursePhaseService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CoursePhaseServiceSingleton = &suite.coursePhaseService

	suite.router = setupRouter()
}

func (suite *RouterTestSuite) TearDownSuite() {
	suite.cleanup()
}

func setupRouter() *gin.Engine {
	router := gin.Default()
	api := router.Group("/api")
	setupCoursePhaseRouter(api)
	return router
}

func (suite *RouterTestSuite) TestGetCoursePhaseByID() {
	req := httptest.NewRequest(http.MethodGet, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b", nil)
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var coursePhase coursePhaseDTO.CoursePhase
	err := json.Unmarshal(w.Body.Bytes(), &coursePhase)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Test", coursePhase.Name, "Expected course phase name to match")
	assert.False(suite.T(), coursePhase.IsInitialPhase, "Expected course phase to not be an initial phase")
	assert.Equal(suite.T(), uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e"), coursePhase.CourseID, "Expected CourseID to match")
	assert.Equal(suite.T(), uuid.MustParse("7dc1c4e8-4255-4874-80a0-0c12b958744b"), coursePhase.CoursePhaseTypeID, "Expected CoursePhaseTypeID to match")
	assert.Equal(suite.T(), "test-value", coursePhase.MetaData["test-key"], "Expected MetaData to match")
}

func (suite *RouterTestSuite) TestCreateCoursePhase() {
	jsonData := `{"new_key": "new_value"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	newCoursePhase := coursePhaseDTO.CreateCoursePhase{
		CourseID:          uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e"),
		Name:              "New Phase",
		IsInitialPhase:    false,
		MetaData:          metaData,
		CoursePhaseTypeID: uuid.MustParse("7dc1c4e8-4255-4874-80a0-0c12b958744c"),
	}

	body, _ := json.Marshal(newCoursePhase)
	req := httptest.NewRequest(http.MethodPost, "/api/course_phases", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var createdCoursePhase coursePhaseDTO.CoursePhase
	err = json.Unmarshal(w.Body.Bytes(), &createdCoursePhase)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "New Phase", createdCoursePhase.Name, "Expected course phase name to match")
	assert.False(suite.T(), createdCoursePhase.IsInitialPhase, "Expected course phase to not be an initial phase")
	assert.Equal(suite.T(), newCoursePhase.CourseID, createdCoursePhase.CourseID, "Expected CourseID to match")
	assert.Equal(suite.T(), newCoursePhase.MetaData, createdCoursePhase.MetaData, "Expected MetaData to match")
	assert.Equal(suite.T(), newCoursePhase.CoursePhaseTypeID, createdCoursePhase.CoursePhaseTypeID, "Expected CoursePhaseTypeID to match")
}

func (suite *RouterTestSuite) TestUpdateCoursePhase() {
	jsonData := `{"updated_key": "updated_value"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	updatedCoursePhase := coursePhaseDTO.UpdateCoursePhase{
		ID:             uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b"),
		Name:           "Updated Phase",
		IsInitialPhase: false,
		MetaData:       metaData,
	}

	body, _ := json.Marshal(updatedCoursePhase)
	req := httptest.NewRequest(http.MethodPut, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// Verify the update by fetching the updated course phase
	fetchReq := httptest.NewRequest(http.MethodGet, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b", nil)
	fetchRes := httptest.NewRecorder()
	suite.router.ServeHTTP(fetchRes, fetchReq)

	assert.Equal(suite.T(), http.StatusOK, fetchRes.Code)

	var fetchedCoursePhase coursePhaseDTO.CoursePhase
	err = json.Unmarshal(fetchRes.Body.Bytes(), &fetchedCoursePhase)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Updated Phase", fetchedCoursePhase.Name, "Expected updated course phase name to match")
	assert.False(suite.T(), fetchedCoursePhase.IsInitialPhase, "Expected course phase not to be an initial phase")
	assert.Equal(suite.T(), updatedCoursePhase.MetaData["updated_key"], fetchedCoursePhase.MetaData["updated_key"], "Expected updated metadata to match")
	assert.Equal(suite.T(), "test-value", fetchedCoursePhase.MetaData["test-key"], "Expected existing metadata to match")
}

func TestRouterTestSuite(t *testing.T) {
	suite.Run(t, new(RouterTestSuite))
}