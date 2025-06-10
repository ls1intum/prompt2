package categories

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/categories/categoryDTO"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type CategoryServiceTestSuite struct {
	suite.Suite
	suiteCtx        context.Context
	cleanup         func()
	categoryService CategoryService
}

func (suite *CategoryServiceTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/categories.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup
	suite.categoryService = CategoryService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CategoryServiceSingleton = &suite.categoryService
	// avoid router initialization here
}

func (suite *CategoryServiceTestSuite) TearDownSuite() {
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

func (suite *CategoryServiceTestSuite) TestListCategories() {
	categories, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(categories), 0, "Expected at least one category")
	for _, c := range categories {
		assert.NotEmpty(suite.T(), c.ID, "Category ID should not be empty")
		assert.NotEmpty(suite.T(), c.Name, "Category Name should not be empty")
		assert.Greater(suite.T(), c.Weight, int32(0), "Category Weight should be positive")
	}
}

func (suite *CategoryServiceTestSuite) TestGetCategory() {
	id := uuid.MustParse("25f1c984-ba31-4cf2-aa8e-5662721bf44e")
	c, err := GetCategory(suite.suiteCtx, id)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), id, c.ID, "Category ID should match")
	assert.Equal(suite.T(), "Version Control", c.Name, "Category name should match")
}

func (suite *CategoryServiceTestSuite) TestGetCategoryNotFound() {
	nonExistent := uuid.New()
	_, err := GetCategory(suite.suiteCtx, nonExistent)
	assert.Error(suite.T(), err, "Expected error for non-existent category")
}

func (suite *CategoryServiceTestSuite) TestCreateCategory() {
	req := categoryDTO.CreateCategoryRequest{
		Name:        "Test Category",
		Description: "A test category",
		Weight:      5,
	}
	err := CreateCategory(suite.suiteCtx, req)
	assert.NoError(suite.T(), err, "Creating category should not produce an error")

	cats, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	found := false
	for _, c := range cats {
		if c.Name == req.Name {
			found = true
			assert.Equal(suite.T(), req.Description, c.Description.String)
			assert.Equal(suite.T(), req.Weight, c.Weight)
			break
		}
	}
	assert.True(suite.T(), found, "Created category should be found in the list")
}

func (suite *CategoryServiceTestSuite) TestUpdateCategory() {
	// use existing category from dump
	id := uuid.MustParse("815b159b-cab3-49b4-8060-c4722d59241d")
	req := categoryDTO.UpdateCategoryRequest{
		Name:        "Updated Category",
		Description: "Updated description",
		Weight:      2,
	}
	err := UpdateCategory(suite.suiteCtx, id, req)
	assert.NoError(suite.T(), err, "Updating category should not produce an error")

	c, err := GetCategory(suite.suiteCtx, id)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), req.Name, c.Name)
	assert.Equal(suite.T(), req.Description, c.Description.String)
	assert.Equal(suite.T(), req.Weight, c.Weight)
}

func (suite *CategoryServiceTestSuite) TestUpdateNonExistentCategory() {
	id := uuid.New()
	req := categoryDTO.UpdateCategoryRequest{
		Name:        "Non-existent",
		Description: "Should not fail",
		Weight:      1,
	}
	err := UpdateCategory(suite.suiteCtx, id, req)
	assert.NoError(suite.T(), err, "Updating non-existent category should not error")
}

func (suite *CategoryServiceTestSuite) TestDeleteCategory() {
	// create category to delete
	reqCreate := categoryDTO.CreateCategoryRequest{
		Name:        "To Delete",
		Description: "To be deleted",
		Weight:      1,
	}
	err := CreateCategory(suite.suiteCtx, reqCreate)
	assert.NoError(suite.T(), err)

	cats, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	var toDeleteID uuid.UUID
	for _, c := range cats {
		if c.Name == reqCreate.Name {
			toDeleteID = c.ID
			break
		}
	}
	err = DeleteCategory(suite.suiteCtx, toDeleteID)
	assert.NoError(suite.T(), err, "Deleting category should not produce an error")
	_, err = GetCategory(suite.suiteCtx, toDeleteID)
	assert.Error(suite.T(), err, "Getting deleted category should produce an error")
}

func (suite *CategoryServiceTestSuite) TestDeleteNonExistentCategory() {
	nonExistent := uuid.New()
	err := DeleteCategory(suite.suiteCtx, nonExistent)
	assert.NoError(suite.T(), err, "Deleting non-existent category should not error")
}

func (suite *CategoryServiceTestSuite) TestGetCategoriesWithCompetencies() {
	// Use a known course phase ID from the test data
	coursePhaseID := uuid.MustParse("4179d58a-d00d-4fa7-94a5-397bc69fab02") // Dev Application phase

	catsWithComp, err := GetCategoriesWithCompetencies(suite.suiteCtx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.GreaterOrEqual(suite.T(), len(catsWithComp), 0, "Should return categories with competencies")

	// Verify the structure of returned data
	for _, cat := range catsWithComp {
		assert.NotEmpty(suite.T(), cat.ID, "Category ID should not be empty")
		assert.NotEmpty(suite.T(), cat.Name, "Category name should not be empty")
		assert.GreaterOrEqual(suite.T(), cat.Weight, int32(1), "Category weight should be at least 1")
		assert.NotNil(suite.T(), cat.Competencies, "Competencies should not be nil")

		// Verify competencies structure if any exist
		for _, comp := range cat.Competencies {
			assert.NotEmpty(suite.T(), comp.ID, "Competency ID should not be empty")
			assert.NotEmpty(suite.T(), comp.Name, "Competency name should not be empty")
			assert.Equal(suite.T(), cat.ID, comp.CategoryID, "Competency should belong to the category")
		}
	}
}

func TestCategoryServiceTestSuite(t *testing.T) {
	suite.Run(t, new(CategoryServiceTestSuite))
}
