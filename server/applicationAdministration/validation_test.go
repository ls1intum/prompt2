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

type ApplicationAdminValidationTestSuite struct {
	suite.Suite
	router                  *gin.Engine
	ctx                     context.Context
	cleanup                 func()
	applicationAdminService ApplicationService
}

func (suite *ApplicationAdminValidationTestSuite) SetupSuite() {
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

func (suite *ApplicationAdminValidationTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateUpdateForm_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	updateForm := applicationDTO.UpdateForm{
		DeleteQuestionsText:        []uuid.UUID{uuid.MustParse("a6a04042-95d1-4765-8592-caf9560c8c3c")},
		DeleteQuestionsMultiSelect: []uuid.UUID{uuid.MustParse("65e25b73-ce47-4536-b651-a1632347d733")},
		CreateQuestionsText: []applicationDTO.CreateQuestionText{
			{
				CoursePhaseID: coursePhaseID,
				Title:         "Valid Title",
				AllowedLength: 100,
			},
		},
		CreateQuestionsMultiSelect: []applicationDTO.CreateQuestionMultiSelect{
			{
				CoursePhaseID: coursePhaseID,
				Title:         "Valid MultiSelect",
				MinSelect:     1,
				MaxSelect:     3,
				Options:       []string{"Option1", "Option2"},
			},
		},
	}
	err := validateUpdateForm(suite.ctx, coursePhaseID, updateForm)
	assert.NoError(suite.T(), err)
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateUpdateForm_InvalidDeleteQuestion() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	updateForm := applicationDTO.UpdateForm{
		DeleteQuestionsText: []uuid.UUID{uuid.New()}, // Non-existent question
	}
	err := validateUpdateForm(suite.ctx, coursePhaseID, updateForm)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "question does not belong to this course", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateUpdateForm_InvalidCreateTextQuestion() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	updateForm := applicationDTO.UpdateForm{
		CreateQuestionsText: []applicationDTO.CreateQuestionText{
			{
				CoursePhaseID: uuid.New(),
				Title:         "",
				AllowedLength: 0,
			},
		},
	}
	err := validateUpdateForm(suite.ctx, coursePhaseID, updateForm)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "course phase id is not correct", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateUpdateForm_InvalidCreateMultiSelect() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	updateForm := applicationDTO.UpdateForm{
		CreateQuestionsMultiSelect: []applicationDTO.CreateQuestionMultiSelect{
			{
				CoursePhaseID: coursePhaseID,
				Title:         "Invalid MultiSelect",
				MinSelect:     -1,
				MaxSelect:     0,
				Options:       []string{},
			},
		},
	}
	err := validateUpdateForm(suite.ctx, coursePhaseID, updateForm)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "minimum selection must be at least 0", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionText_EmptyTitle() {
	err := validateQuestionText("", "", 100)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "title is required", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionText_InvalidRegex() {
	err := validateQuestionText("Valid Title", "[", 100)
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "invalid regex pattern")
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionMultiSelect_EmptyTitle() {
	err := validateQuestionMultiSelect("", 1, 3, []string{"Option1", "Option2"})
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "title is required", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionMultiSelect_EmptyOptions() {
	err := validateQuestionMultiSelect("Valid Title", 1, 3, []string{})
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "options cannot be empty", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionMultiSelect_MinSelectNegative() {
	err := validateQuestionMultiSelect("Valid Title", -1, 3, []string{"Option1", "Option2"})
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "minimum selection must be at least 0", err.Error())
}

func (suite *ApplicationAdminValidationTestSuite) TestValidateQuestionMultiSelect_MaxSelectLessThanOne() {
	err := validateQuestionMultiSelect("Valid Title", 0, 0, []string{"Option1", "Option2"})
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), "maximum selection must be at least 1", err.Error())
}

func TestValidateUpdateFormSuite(t *testing.T) {
	suite.Run(t, new(ApplicationAdminValidationTestSuite))
}
