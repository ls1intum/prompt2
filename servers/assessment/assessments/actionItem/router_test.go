package actionItem

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

	"github.com/ls1intum/prompt2/servers/assessment/assessments/actionItem/actionItemDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type ActionItemRouterTestSuite struct {
	suite.Suite
	router   *gin.Engine
	suiteCtx context.Context
	cleanup  func()
	service  ActionItemService
}

func (suite *ActionItemRouterTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../../database_dumps/assessments.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup

	suite.service = ActionItemService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	ActionItemServiceSingleton = &suite.service

	suite.router = gin.Default()
	api := suite.router.Group("/api/course_phase/:coursePhaseID")
	testMiddleware := func(allowedRoles ...string) gin.HandlerFunc {
		return testutils.MockAuthMiddlewareWithEmail(allowedRoles, "user@example.com", "1234", "id")
	}
	// attach routes
	setupActionItemRouter(api, testMiddleware)
}

func (suite *ActionItemRouterTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *ActionItemRouterTestSuite) TestCreateActionItemInvalidJSON() {
	phaseID := uuid.New()
	req, _ := http.NewRequest("POST", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *ActionItemRouterTestSuite) TestCreateActionItemValid() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.MustParse("ca42e447-60f9-4fe0-b297-2dae3f924fd7")

	payload := actionItemDTO.CreateActionItemRequest{
		CoursePhaseID:         phaseID,
		CourseParticipationID: partID,
		Action:                "Test action item",
		Author:                "tester",
	}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusCreated, resp.Code)
}

func (suite *ActionItemRouterTestSuite) TestGetActionItemsForStudentValid() {
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	partID := uuid.MustParse("ca42e447-60f9-4fe0-b297-2dae3f924fd7")
	req, _ := http.NewRequest("GET", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item/course-participation/"+partID.String(), nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var items []actionItemDTO.ActionItem
	err := json.Unmarshal(resp.Body.Bytes(), &items)
	assert.NoError(suite.T(), err)
}

func (suite *ActionItemRouterTestSuite) TestUpdateActionItemInvalidID() {
	phaseID := uuid.New()
	req, _ := http.NewRequest("PUT", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item/invalid-uuid", bytes.NewBuffer([]byte("{}")))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *ActionItemRouterTestSuite) TestDeleteActionItemInvalidID() {
	phaseID := uuid.New()
	req, _ := http.NewRequest("DELETE", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item/invalid-uuid", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.Code)
}

func (suite *ActionItemRouterTestSuite) TestGetActionItemsForStudentInvalidIDs() {
	// invalid phase
	req1, _ := http.NewRequest("GET", "/api/course_phase/invalid-phase/student-assessment/action-item/course-participation/"+uuid.New().String(), nil)
	rep1 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep1, req1)
	assert.Equal(suite.T(), http.StatusBadRequest, rep1.Code)

	// invalid participation
	phaseID := uuid.MustParse("24461b6b-3c3a-4bc6-ba42-69eeb1514da9")
	req2, _ := http.NewRequest("GET", "/api/course_phase/"+phaseID.String()+"/student-assessment/action-item/course-participation/invalid-uuid", nil)
	rep2 := httptest.NewRecorder()
	suite.router.ServeHTTP(rep2, req2)
	assert.Equal(suite.T(), http.StatusBadRequest, rep2.Code)
}

func TestActionItemRouterTestSuite(t *testing.T) {
	suite.Run(t, new(ActionItemRouterTestSuite))
}
