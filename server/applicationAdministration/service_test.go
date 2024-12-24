package applicationAdministration

import (
	"context"
	"log"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ApplicationAdminServiceTestSuite struct {
	suite.Suite
	router                  *gin.Engine
	ctx                     context.Context
	cleanup                 func()
	applicationAdminService ApplicationService
}

func (suite *ApplicationAdminServiceTestSuite) SetupSuite() {
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
}

func (suite *ApplicationAdminServiceTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationForm_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")

	form, err := GetApplicationForm(suite.ctx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), form)
	assert.NotEmpty(suite.T(), form.QuestionsText)
	assert.NotEmpty(suite.T(), form.QuestionsMultiSelect)

	// Verify QuestionsText
	assert.Equal(suite.T(), 2, len(form.QuestionsText))
	for _, question := range form.QuestionsText {
		if question.Title == "Motivation" {
			assert.Equal(suite.T(), 500, question.AllowedLength)
		} else if question.Title == "Expierence" {
			assert.Equal(suite.T(), 500, question.AllowedLength)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}

	// Verify QuestionsMultiSelect
	assert.Equal(suite.T(), 2, len(form.QuestionsMultiSelect))
	for _, question := range form.QuestionsMultiSelect {
		if question.Title == "Taken Courses" {
			assert.ElementsMatch(suite.T(), []string{"Ferienakademie", "Patterns", "Interactive Learning"}, question.Options)
		} else if question.Title == "Available Devices" {
			assert.ElementsMatch(suite.T(), []string{"iPhone", "iPad", "MacBook", "Vision"}, question.Options)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationForm_NotApplicationPhase() {
	nonApplicationPhaseID := uuid.MustParse("7062236a-e290-487c-be41-29b24e0afc64")

	_, err := GetApplicationForm(suite.ctx, nonApplicationPhaseID)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "course phase is not an application phase", err.Error())
}

func (suite *ApplicationAdminServiceTestSuite) TestUpdateApplicationForm_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	updateForm := applicationDTO.UpdateForm{
		DeleteQuestionsText:        []uuid.UUID{uuid.MustParse("a6a04042-95d1-4765-8592-caf9560c8c3c")},
		DeleteQuestionsMultiSelect: []uuid.UUID{uuid.MustParse("383a9590-fba2-4e6b-a32b-88895d55fb9b")},
		CreateQuestionsText: []applicationDTO.CreateQuestionText{
			{
				CoursePhaseID: coursePhaseID,
				Title:         "New Motivation",
				AllowedLength: 300,
			},
		},
		CreateQuestionsMultiSelect: []applicationDTO.CreateQuestionMultiSelect{
			{
				CoursePhaseID: coursePhaseID,
				Title:         "New Devices",
				MinSelect:     1,
				MaxSelect:     5,
				Options:       []string{"Option1", "Option2"},
			},
		},
	}

	err := UpdateApplicationForm(suite.ctx, coursePhaseID, updateForm)
	assert.NoError(suite.T(), err)

	// Verify updates
	form, err := GetApplicationForm(suite.ctx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), form)

	// Verify QuestionsText
	assert.Equal(suite.T(), 2, len(form.QuestionsText))
	for _, question := range form.QuestionsText {
		if question.Title == "New Motivation" {
			assert.Equal(suite.T(), 300, question.AllowedLength)
		} else if question.Title == "Expierence" {
			assert.Equal(suite.T(), 500, question.AllowedLength)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}

	// Verify QuestionsMultiSelect
	assert.Equal(suite.T(), 2, len(form.QuestionsMultiSelect))
	for _, question := range form.QuestionsMultiSelect {
		if question.Title == "New Devices" {
			assert.ElementsMatch(suite.T(), []string{"Option1", "Option2"}, question.Options)
		} else if question.Title == "Taken Courses" {
			assert.ElementsMatch(suite.T(), []string{"Ferienakademie", "Patterns", "Interactive Learning"}, question.Options)
		} else {
			suite.T().Errorf("Unexpected question title: %s", question.Title)
		}
	}
}

func (suite *ApplicationAdminServiceTestSuite) TestUpdateApplicationForm_NotApplicationPhase() {
	nonApplicationPhaseID := uuid.MustParse("7062236a-e290-487c-be41-29b24e0afc64")
	updateForm := applicationDTO.UpdateForm{}

	err := UpdateApplicationForm(suite.ctx, nonApplicationPhaseID, updateForm)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "course phase is not an application phase", err.Error())
}

func TestApplicationAdminServiceTestSuite(t *testing.T) {
	suite.Run(t, new(ApplicationAdminServiceTestSuite))
}
