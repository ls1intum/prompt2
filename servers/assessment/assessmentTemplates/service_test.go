package assessmentTemplates

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type AssessmentTemplateServiceTestSuite struct {
	suite.Suite
	suiteCtx                  context.Context
	cleanup                   func()
	assessmentTemplateService AssessmentTemplateService
}

func (suite *AssessmentTemplateServiceTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/categories.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.assessmentTemplateService = AssessmentTemplateService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	AssessmentTemplateServiceSingleton = &suite.assessmentTemplateService
}

func (suite *AssessmentTemplateServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *AssessmentTemplateServiceTestSuite) TestListAssessmentTemplates() {
	templates, err := ListAssessmentTemplates(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(templates), 0, "Expected at least one assessment template")

	// Check that the default template from the dump exists
	found := false
	for _, template := range templates {
		if template.Name == "Intro Course Assessment Template" {
			found = true
			assert.Equal(suite.T(), "This is the default assessment template.", template.Description)
			break
		}
	}
	assert.True(suite.T(), found, "Default assessment template should be found")
}

func (suite *AssessmentTemplateServiceTestSuite) TestGetAssessmentTemplate() {
	// Use the default assessment template ID from the database dump
	defaultID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	template, err := GetAssessmentTemplate(suite.suiteCtx, defaultID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), defaultID, template.ID)
	assert.Equal(suite.T(), "Intro Course Assessment Template", template.Name)
	assert.Equal(suite.T(), "This is the default assessment template.", template.Description)
}

func TestAssessmentTemplateServiceTestSuite(t *testing.T) {
	suite.Run(t, new(AssessmentTemplateServiceTestSuite))
}
