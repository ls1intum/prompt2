package coursePhaseParticipation

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type RouterTestSuite struct {
	suite.Suite
	router                          *gin.Engine
	ctx                             context.Context
	cleanup                         func()
	coursePhaseParticipationService CoursePhaseParticipationService
}

func (suite *RouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../../database_dumps/full_db.sql")
	if err != nil {
		log.Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.coursePhaseParticipationService = CoursePhaseParticipationService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CoursePhaseParticipationServiceSingleton = &suite.coursePhaseParticipationService

	suite.router = setupRouter()
}

func (suite *RouterTestSuite) TearDownSuite() {
	suite.cleanup()
}

func setupRouter() *gin.Engine {
	router := gin.Default()
	api := router.Group("/api")
	setupCoursePhaseParticipationRouter(api, func() gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail([]string{"PROMPT_Admin", "iPraktikum-ios24245-Lecturer"}, "existingstudent@example.com", "1234567", "ab12cde")
	}, testutils.MockPermissionMiddleware)
	return router
}

func (suite *RouterTestSuite) TestGetParticipationsForCoursePhase() {
	req := httptest.NewRequest(http.MethodGet, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations", nil)
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	var participations []coursePhaseParticipationDTO.GetCoursePhaseParticipation
	err := json.Unmarshal(w.Body.Bytes(), &participations)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(participations), 0, "Expected participations to be returned")
}

func (suite *RouterTestSuite) TestCreateCoursePhaseParticipation() {
	jsonData := `{"a": "b"}`
	var restrictedData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &restrictedData)
	assert.NoError(suite.T(), err)
	fail := db.PassStatusFailed

	newParticipation := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
		CourseParticipationID: uuid.MustParse("ca41772a-e06d-40eb-9c4b-ab44e06a890c"),
		PassStatus:            &fail,
		RestrictedData:        restrictedData,
	}
	body, _ := json.Marshal(newParticipation)

	req := httptest.NewRequest(http.MethodPost, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)
	var createdParticipation coursePhaseParticipationDTO.GetCoursePhaseParticipation
	err = json.Unmarshal(w.Body.Bytes(), &createdParticipation)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newParticipation.CourseParticipationID, createdParticipation.CourseParticipationID)
}

func (suite *RouterTestSuite) TestUpdateCoursePhaseParticipation() {
	jsonData := `{"other-value": "some skills"}`
	var data meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &data)
	assert.NoError(suite.T(), err)
	pass := db.PassStatusPassed

	updatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipationRequest{
		ID:                  uuid.MustParse("83d88b1f-1435-4c36-b8ca-6741094f35e4"),
		RestrictedData:      data,
		StudentReadableData: data,
		PassStatus:          &pass,
	}
	body, _ := json.Marshal(updatedParticipation)

	// Send the update request
	req := httptest.NewRequest(http.MethodPut, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations/83d88b1f-1435-4c36-b8ca-6741094f35e4", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	// Assert the update request was successful
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// Perform a GET request to verify the changes
	getReq := httptest.NewRequest(http.MethodGet, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations/83d88b1f-1435-4c36-b8ca-6741094f35e4", nil)
	getW := httptest.NewRecorder()

	suite.router.ServeHTTP(getW, getReq)

	// Assert the GET request was successful
	assert.Equal(suite.T(), http.StatusOK, getW.Code)

	// Verify the returned data matches the expected updated data
	var updated coursePhaseParticipationDTO.GetCoursePhaseParticipation
	err = json.Unmarshal(getW.Body.Bytes(), &updated)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, updated.ID, "Participation ID should match")
	assert.Equal(suite.T(), "passed", updated.PassStatus, "PassStatus should match")
	assert.Equal(suite.T(), updatedParticipation.RestrictedData["other-value"], updated.RestrictedData["other-value"], "New Meta data should match")
	assert.Equal(suite.T(), updatedParticipation.StudentReadableData["other-value"], updated.StudentReadableData["other-value"], "New Meta data should match")

}

func (suite *RouterTestSuite) TestUpdateNewCoursePhaseParticipation() {
	jsonData := `{"other-value": "some skills"}`
	var data meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &data)
	assert.NoError(suite.T(), err)
	pass := db.PassStatusPassed

	toBecreatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipationRequest{
		CourseParticipationID: uuid.MustParse("f6744410-cfe2-456d-96fa-e857cf989569"),
		RestrictedData:        data,
		StudentReadableData:   data,
		PassStatus:            &pass,
	}
	body, _ := json.Marshal(toBecreatedParticipation)

	// Send the update request
	req := httptest.NewRequest(http.MethodPut, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations/00000000-0000-0000-0000-000000000000", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	// Assert the update request was successful
	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	newId := strings.ReplaceAll(w.Body.String(), "\"", "")

	// Perform a GET request to verify the changes
	getReq := httptest.NewRequest(http.MethodGet, "/api/course_phases/4e736d05-c125-48f0-8fa0-848b03ca6908/participations/"+newId, nil)
	getW := httptest.NewRecorder()

	suite.router.ServeHTTP(getW, getReq)

	// Assert the GET request was successful
	assert.Equal(suite.T(), http.StatusOK, getW.Code)

	// Verify the returned data matches the expected updated data
	var createdParticipation coursePhaseParticipationDTO.GetCoursePhaseParticipation
	err = json.Unmarshal(getW.Body.Bytes(), &createdParticipation)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), createdParticipation.ID, uuid.MustParse(newId), "Participation ID should match")
	assert.Equal(suite.T(), "passed", createdParticipation.PassStatus, "PassStatus should match")
	assert.Equal(suite.T(), toBecreatedParticipation.RestrictedData["other-value"], createdParticipation.RestrictedData["other-value"], "New Meta data should match")
	assert.Equal(suite.T(), toBecreatedParticipation.StudentReadableData["other-value"], createdParticipation.StudentReadableData["other-value"], "New Meta data should match")
}

func TestRouterTestSuite(t *testing.T) {
	suite.Run(t, new(RouterTestSuite))
}
