package applicationAdministration

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
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ApplicationAdminRouterTestSuite struct {
	suite.Suite
	router                  *gin.Engine
	ctx                     context.Context
	cleanup                 func()
	applicationAdminService ApplicationService
}

func (suite *ApplicationAdminRouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/application_administration.sql")
	if err != nil {
		log.Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.applicationAdminService = ApplicationService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}

	ApplicationServiceSingleton = &suite.applicationAdminService
	suite.router = gin.Default()
	api := suite.router.Group("/api")
	setupApplicationRouter(api, func() gin.HandlerFunc {
		return testutils.MockAuthMiddleware([]string{"PROMPT_Admin", "iPraktikum-ios24245-Lecturer"})
	}, testutils.MockPermissionMiddleware)

}

func (suite *ApplicationAdminRouterTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *ApplicationAdminRouterTestSuite) TestGetApplicationFormEndpoint_Success() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"
	req := httptest.NewRequest(http.MethodGet, "/api/applications/"+coursePhaseID+"/form", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
	var form applicationDTO.Form
	err := json.Unmarshal(resp.Body.Bytes(), &form)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), form)
	assert.NotEmpty(suite.T(), form.QuestionsText)
	assert.NotEmpty(suite.T(), form.QuestionsMultiSelect)
}

func (suite *ApplicationAdminRouterTestSuite) TestUpdateApplicationFormEndpoint_Success() {
	coursePhaseID := "4179d58a-d00d-4fa7-94a5-397bc69fab02"
	updateForm := applicationDTO.UpdateForm{
		DeleteQuestionsText:        []uuid.UUID{uuid.MustParse("a6a04042-95d1-4765-8592-caf9560c8c3c")},
		DeleteQuestionsMultiSelect: []uuid.UUID{uuid.MustParse("65e25b73-ce47-4536-b651-a1632347d733")},
		CreateQuestionsText: []applicationDTO.CreateQuestionText{
			{
				CoursePhaseID: uuid.MustParse(coursePhaseID),
				Title:         "New Motivation",
				AllowedLength: 300,
			},
		},
		CreateQuestionsMultiSelect: []applicationDTO.CreateQuestionMultiSelect{
			{
				CoursePhaseID: uuid.MustParse(coursePhaseID),
				Title:         "New Devices",
				MinSelect:     1,
				MaxSelect:     5,
				Options:       []string{"Option1", "Option2"},
			},
		},
	}

	jsonBody, err := json.Marshal(updateForm)
	assert.NoError(suite.T(), err)

	req := httptest.NewRequest(http.MethodPut, "/api/applications/"+coursePhaseID+"/form", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)
	var responseBody map[string]string
	err = json.Unmarshal(resp.Body.Bytes(), &responseBody)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "application form updated", responseBody["message"])

	// Verify updates via GET
	getReq := httptest.NewRequest(http.MethodGet, "/api/applications/"+coursePhaseID+"/form", nil)
	getResp := httptest.NewRecorder()
	suite.router.ServeHTTP(getResp, getReq)

	assert.Equal(suite.T(), http.StatusOK, getResp.Code)
	var updatedForm applicationDTO.Form
	err = json.Unmarshal(getResp.Body.Bytes(), &updatedForm)
	assert.NoError(suite.T(), err)

	// Verify QuestionsText
	assert.Equal(suite.T(), 2, len(updatedForm.QuestionsText))
	for _, question := range updatedForm.QuestionsText {
		if question.Title == "New Motivation" {
			assert.Equal(suite.T(), 300, question.AllowedLength)
		} else if question.Title == "Expierence" {
			assert.Equal(suite.T(), 500, question.AllowedLength)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}

	// Verify QuestionsMultiSelect
	assert.Equal(suite.T(), 2, len(updatedForm.QuestionsMultiSelect))
	for _, question := range updatedForm.QuestionsMultiSelect {
		if question.Title == "New Devices" {
			assert.ElementsMatch(suite.T(), []string{"Option1", "Option2"}, question.Options)
		} else if question.Title == "Available Devices" {
			assert.ElementsMatch(suite.T(), []string{"iPhone", "iPad", "MacBook", "Vision"}, question.Options)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}
}

func TestApplicationAdminRouterTestSuite(t *testing.T) {
	suite.Run(t, new(ApplicationAdminRouterTestSuite))
}
