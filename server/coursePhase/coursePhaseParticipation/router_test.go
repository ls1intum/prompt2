package coursePhaseParticipation

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
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
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
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../../database_dumps/course_phase_participation_test.sql")
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
	setupCoursePhaseParticipationRouter(api)
	return router
}

func (suite *RouterTestSuite) TestGetParticipationsForCoursePhase() {
	req := httptest.NewRequest(http.MethodGet, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b/participations", nil)
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
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	newParticipation := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
		CourseParticipationID: uuid.MustParse("65dcc535-a9ab-4421-a2bc-0f09780ca59e"),
		Passed:                false,
		MetaData:              metaData,
	}
	body, _ := json.Marshal(newParticipation)

	req := httptest.NewRequest(http.MethodPost, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b/participations", bytes.NewReader(body))
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
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	updatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
		ID:       uuid.MustParse("7698f081-df55-4136-a58c-1a166bb1bbda"),
		MetaData: metaData,
		Passed:   pgtype.Bool{Bool: true, Valid: true},
	}
	body, _ := json.Marshal(updatedParticipation)

	req := httptest.NewRequest(http.MethodPut, "/api/course_phases/3d1f3b00-87f3-433b-a713-178c4050411b/participations/7698f081-df55-4136-a58c-1a166bb1bbda", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)
	var updated coursePhaseParticipationDTO.UpdateCoursePhaseParticipation
	err = json.Unmarshal(w.Body.Bytes(), &updated)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, updated.ID)
	assert.Equal(suite.T(), updatedParticipation.Passed, updated.Passed)
	assert.Equal(suite.T(), "some skills", updated.MetaData["other-value"])
	assert.Equal(suite.T(), "none", updated.MetaData["skills"])
}

func TestRouterTestSuite(t *testing.T) {
	suite.Run(t, new(RouterTestSuite))
}
