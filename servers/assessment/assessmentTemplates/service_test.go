package assessmentTemplates

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/assessmentTemplates/assessmentTemplateDTO"
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

func (suite *AssessmentTemplateServiceTestSuite) TestCreateAssessmentTemplate() {
	req := assessmentTemplateDTO.CreateAssessmentTemplateRequest{
		Name:        "Test Template",
		Description: "Test Description",
	}

	template, err := CreateAssessmentTemplate(suite.suiteCtx, req)
	assert.NoError(suite.T(), err, "Should be able to create assessment template")
	assert.NotEqual(suite.T(), uuid.Nil, template.ID, "Should have a valid ID")
	assert.Equal(suite.T(), req.Name, template.Name, "Name should match")
	assert.Equal(suite.T(), req.Description, template.Description, "Description should match")
}

func (suite *AssessmentTemplateServiceTestSuite) TestGetAssessmentTemplateNotFound() {
	nonExistentID := uuid.New()

	_, err := GetAssessmentTemplate(suite.suiteCtx, nonExistentID)
	assert.Error(suite.T(), err, "Should return error for non-existent template")
}

func (suite *AssessmentTemplateServiceTestSuite) TestUpdateAssessmentTemplate() {
	// First create a template
	createReq := assessmentTemplateDTO.CreateAssessmentTemplateRequest{
		Name:        "Original Template",
		Description: "Original Description",
	}

	template, err := CreateAssessmentTemplate(suite.suiteCtx, createReq)
	assert.NoError(suite.T(), err, "Should be able to create assessment template")

	// Now update it
	updateReq := assessmentTemplateDTO.UpdateAssessmentTemplateRequest{
		Name:        "Updated Template",
		Description: "Updated Description",
	}

	err = UpdateAssessmentTemplate(suite.suiteCtx, template.ID, updateReq)
	assert.NoError(suite.T(), err, "Should be able to update assessment template")

	// Verify the update
	updatedTemplate, err := GetAssessmentTemplate(suite.suiteCtx, template.ID)
	assert.NoError(suite.T(), err, "Should be able to retrieve updated template")
	assert.Equal(suite.T(), updateReq.Name, updatedTemplate.Name, "Name should be updated")
	assert.Equal(suite.T(), updateReq.Description, updatedTemplate.Description, "Description should be updated")
}

func (suite *AssessmentTemplateServiceTestSuite) TestUpdateAssessmentTemplateNotFound() {
	nonExistentID := uuid.New()
	updateReq := assessmentTemplateDTO.UpdateAssessmentTemplateRequest{
		Name:        "Updated Template",
		Description: "Updated Description",
	}

	err := UpdateAssessmentTemplate(suite.suiteCtx, nonExistentID, updateReq)
	assert.Error(suite.T(), err, "Should return error for non-existent template")
}

func (suite *AssessmentTemplateServiceTestSuite) TestDeleteAssessmentTemplate() {
	// First create a template
	createReq := assessmentTemplateDTO.CreateAssessmentTemplateRequest{
		Name:        "Template to Delete",
		Description: "Will be deleted",
	}

	template, err := CreateAssessmentTemplate(suite.suiteCtx, createReq)
	assert.NoError(suite.T(), err, "Should be able to create assessment template")

	// Now delete it
	err = DeleteAssessmentTemplate(suite.suiteCtx, template.ID)
	assert.NoError(suite.T(), err, "Should be able to delete assessment template")

	// Verify it's gone
	_, err = GetAssessmentTemplate(suite.suiteCtx, template.ID)
	assert.Error(suite.T(), err, "Should return error for deleted template")
}

func (suite *AssessmentTemplateServiceTestSuite) TestDeleteAssessmentTemplateNotFound() {
	nonExistentID := uuid.New()

	err := DeleteAssessmentTemplate(suite.suiteCtx, nonExistentID)
	// This may or may not error depending on implementation - test that it doesn't panic
	_ = err // Ignore the error for this test
	assert.NotPanics(suite.T(), func() {
		_ = DeleteAssessmentTemplate(suite.suiteCtx, nonExistentID)
	})
}

func (suite *AssessmentTemplateServiceTestSuite) TestGetCoursePhasesByAssessmentTemplate() {
	defaultID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

	coursePhases, err := GetCoursePhasesByAssessmentTemplate(suite.suiteCtx, defaultID)
	assert.NoError(suite.T(), err, "Should be able to get course phases")
	assert.NotNil(suite.T(), coursePhases, "Should return non-nil slice")
	assert.IsType(suite.T(), []uuid.UUID{}, coursePhases, "Should return correct type")
}

func TestAssessmentTemplateServiceTestSuite(t *testing.T) {
	suite.Run(t, new(AssessmentTemplateServiceTestSuite))
}
