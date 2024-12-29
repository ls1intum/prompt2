package applicationAdministration

import (
	"context"
	"log"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/applicationAdministration/applicationDTO"
	"github.com/niclasheun/prompt2.0/course/courseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/student"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
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
	student.InitStudentModule(suite.router.Group("/api"), *testDB.Queries, testDB.Conn)
	courseParticipation.InitCourseParticipationModule(suite.router.Group("/api"), *testDB.Queries, testDB.Conn)
	coursePhaseParticipation.InitCoursePhaseParticipationModule(suite.router.Group("/api"), *testDB.Queries, testDB.Conn)

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

func (suite *ApplicationAdminServiceTestSuite) TestGetOpenApplicationPhases_Success() {
	openPhases, err := GetOpenApplicationPhases(suite.ctx)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), openPhases)
	assert.Greater(suite.T(), len(openPhases), 0)

	for _, phase := range openPhases {
		assert.NotEmpty(suite.T(), phase.CourseName)
		assert.NotEmpty(suite.T(), phase.EndDate)
	}
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationFormWithDetails_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")

	formWithDetails, err := GetApplicationFormWithDetails(suite.ctx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), formWithDetails)
	assert.NotEmpty(suite.T(), formWithDetails.QuestionsText)
	assert.NotEmpty(suite.T(), formWithDetails.QuestionsMultiSelect)
	assert.NotEmpty(suite.T(), formWithDetails.ApplicationPhase.CourseName)
	assert.NotEmpty(suite.T(), formWithDetails.ApplicationPhase.ApplicationDeadline)
	assert.NotEmpty(suite.T(), formWithDetails.ApplicationPhase.StartDate)
	assert.NotEmpty(suite.T(), formWithDetails.ApplicationPhase.EndDate)
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationFormWithDetails_NotFound() {
	invalidCoursePhaseID := uuid.New()

	_, err := GetApplicationFormWithDetails(suite.ctx, invalidCoursePhaseID)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), ErrNotFound, err)
}

func (suite *ApplicationAdminServiceTestSuite) TestPostApplicationExtern_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	application := applicationDTO.PostApplication{
		Student: studentDTO.CreateStudent{
			FirstName:            "John",
			LastName:             "Doe",
			Email:                "johndoe-new@example.com",
			HasUniversityAccount: false,
			Gender:               db.GenderMale,
		},
		AnswersText: []applicationDTO.CreateAnswerText{
			{
				ApplicationQuestionID: uuid.MustParse("a6a04042-95d1-4765-8592-caf9560c8c3c"),
				Answer:                "This is a valid answer.",
			},
		},
		AnswersMultiSelect: []applicationDTO.CreateAnswerMultiSelect{
			{
				ApplicationQuestionID: uuid.MustParse("383a9590-fba2-4e6b-a32b-88895d55fb9b"),
				Answer:                []string{"Option1", "Option2"},
			},
		},
	}

	err := PostApplicationExtern(suite.ctx, coursePhaseID, application)
	assert.NoError(suite.T(), err)
}

func (suite *ApplicationAdminServiceTestSuite) TestPostApplicationExtern_AlreadyApplied() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	application := applicationDTO.PostApplication{
		Student: studentDTO.CreateStudent{
			FirstName:            "John",
			LastName:             "Doe",
			Email:                "johndoe-new-2@example.com",
			HasUniversityAccount: false,
			Gender:               db.GenderDiverse,
		},
	}

	// Apply once
	err := PostApplicationExtern(suite.ctx, coursePhaseID, application)
	assert.NoError(suite.T(), err)

	// Apply again, should fail
	err = PostApplicationExtern(suite.ctx, coursePhaseID, application)
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), ErrAlreadyApplied, err)
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationAuthenticatedByEmail_NotApplied() {
	email := "existingstudent@example.com"
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")

	application, err := GetApplicationAuthenticatedByEmail(suite.ctx, email, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), application)
	assert.Equal(suite.T(), applicationDTO.StatusNotApplied, application.Status)
	assert.NotNil(suite.T(), application.Student)
}

func (suite *ApplicationAdminServiceTestSuite) TestGetApplicationAuthenticatedByEmail_Unknown() {
	email := "newstudent@example.com"
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")

	application, err := GetApplicationAuthenticatedByEmail(suite.ctx, email, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), application)
	assert.Equal(suite.T(), applicationDTO.StatusNewUser, application.Status)
	assert.Nil(suite.T(), application.Student)
	assert.Empty(suite.T(), application.AnswersText)
	assert.Empty(suite.T(), application.AnswersMultiSelect)
}

func (suite *ApplicationAdminServiceTestSuite) TestPostApplicationAuthenticatedStudent_Success() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	application := applicationDTO.PostApplication{
		Student: studentDTO.CreateStudent{
			FirstName:            "John",
			LastName:             "Doe",
			Email:                "autStudent@example.com",
			HasUniversityAccount: true,
			MatriculationNumber:  "03711111",
			UniversityLogin:      "ab12cde",
			Gender:               db.GenderFemale,
		},
		AnswersText: []applicationDTO.CreateAnswerText{
			{
				ApplicationQuestionID: uuid.MustParse("a6a04042-95d1-4765-8592-caf9560c8c3c"),
				Answer:                "Valid answer.",
			},
		},
		AnswersMultiSelect: []applicationDTO.CreateAnswerMultiSelect{
			{
				ApplicationQuestionID: uuid.MustParse("383a9590-fba2-4e6b-a32b-88895d55fb9b"),
				Answer:                []string{"Option1"},
			},
		},
	}

	err := PostApplicationAuthenticatedStudent(suite.ctx, coursePhaseID, application)
	assert.NoError(suite.T(), err)
}

func (suite *ApplicationAdminServiceTestSuite) TestPostApplicationAuthenticatedStudent_UpdateDetails() {
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02")
	application := applicationDTO.PostApplication{
		Student: studentDTO.CreateStudent{
			FirstName:            "John",
			LastName:             "Doe",
			Email:                "autStudent@example.com",
			HasUniversityAccount: true,
			MatriculationNumber:  "03711111",
			UniversityLogin:      "ab12cde",
			Gender:               db.GenderFemale,
		},
	}

	// Apply with existing email but updated details
	err := PostApplicationAuthenticatedStudent(suite.ctx, coursePhaseID, application)
	assert.NoError(suite.T(), err)
}

func TestApplicationAdminServiceTestSuite(t *testing.T) {
	suite.Run(t, new(ApplicationAdminServiceTestSuite))
}
