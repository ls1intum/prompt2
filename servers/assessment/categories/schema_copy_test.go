package categories

import (
	"context"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"github.com/ls1intum/prompt2/servers/assessment/assessmentSchemas"
	"github.com/ls1intum/prompt2/servers/assessment/categories/categoryDTO"
	"github.com/ls1intum/prompt2/servers/assessment/coursePhaseConfig"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/ls1intum/prompt2/servers/assessment/testutils"
)

type SchemaCopyTestSuite struct {
	suite.Suite
	suiteCtx        context.Context
	cleanup         func()
	mockCoreCleanup func()
	categoryService CategoryService
}

func (suite *SchemaCopyTestSuite) SetupSuite() {
	suite.suiteCtx = context.Background()
	testDB, cleanup, err := testutils.SetupTestDB(suite.suiteCtx, "../database_dumps/schema_copy_tests.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup

	// Set up mock core service
	_, mockCleanup := testutils.SetupMockCoreService()
	suite.mockCoreCleanup = mockCleanup

	// Initialize category service (we're in the same package so we can access unexported fields)
	suite.categoryService = CategoryService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CategoryServiceSingleton = &suite.categoryService

	// Initialize other service modules
	suite.initializeServiceSingletons(testDB)
}

// initializeServiceSingletons is a helper to set up service singletons for testing
func (suite *SchemaCopyTestSuite) initializeServiceSingletons(testDB *testutils.TestDB) {
	// Create temporary minimal router for init
	router := gin.New()
	group := router.Group("")
	assessmentSchemas.InitAssessmentSchemaModule(group, *testDB.Queries, testDB.Conn)
	coursePhaseConfig.InitCoursePhaseConfigModule(group, *testDB.Queries, testDB.Conn)
}

func (suite *SchemaCopyTestSuite) TearDownSuite() {
	if suite.mockCoreCleanup != nil {
		suite.mockCoreCleanup()
	}
	if suite.cleanup != nil {
		suite.cleanup()
	}
}

// TestUpdateCategory_NoAssessments tests updating a category when there are no assessments
// in any course phase. In this case, the schema should NOT be copied.
func (suite *SchemaCopyTestSuite) TestUpdateCategory_NoAssessments() {
	// Use Phase 1 which has no assessments/evaluations
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000001")
	categoryID := uuid.MustParse("20000000-0000-0000-0000-000000000001") // Test Category 1
	originalSchemaID := uuid.MustParse("00000000-0000-0000-0000-000000000001")

	// Count schemas before update
	schemasBefore, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountBefore := len(schemasBefore)

	// Update the category
	req := categoryDTO.UpdateCategoryRequest{
		Name:               "Updated Category No Assessments",
		ShortName:          "UCNA",
		Description:        "Updated description",
		Weight:             5,
		AssessmentSchemaID: originalSchemaID,
	}

	err = UpdateCategory(suite.suiteCtx, categoryID, coursePhaseID, req)
	assert.NoError(suite.T(), err, "Updating category should not produce an error")

	// Count schemas after update - should be the same
	schemasAfter, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountAfter := len(schemasAfter)

	assert.Equal(suite.T(), schemasCountBefore, schemasCountAfter,
		"No new schema should be created when there are no assessments in other phases")

	// Verify the category was updated
	updatedCategory, err := GetCategory(suite.suiteCtx, categoryID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), req.Name, updatedCategory.Name, "Category name should be updated")
	assert.Equal(suite.T(), req.Weight, updatedCategory.Weight, "Category weight should be updated")

	// Verify the category still belongs to the original schema
	assert.Equal(suite.T(), originalSchemaID, updatedCategory.AssessmentSchemaID,
		"Category should still belong to the original schema")

	// Verify course phase config still points to original schema
	config, err := coursePhaseConfig.GetCoursePhaseConfig(suite.suiteCtx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), originalSchemaID, config.AssessmentSchemaID,
		"Course phase config should still point to original schema")
}

// TestUpdateCategory_WithAssessmentsInOtherPhase tests updating a category when there are
// assessments/evaluations in another course phase. In this case, the schema SHOULD be copied.
func (suite *SchemaCopyTestSuite) TestUpdateCategory_WithAssessmentsInOtherPhase() {
	// Use Phase 2 (current phase, no assessments) but Phase 4 has assessments
	currentPhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000002")
	categoryID := uuid.MustParse("20000000-0000-0000-0000-000000000002") // Test Category 2
	originalSchemaID := uuid.MustParse("00000000-0000-0000-0000-000000000002")

	// Count schemas before update
	schemasBefore, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountBefore := len(schemasBefore)

	// Count categories before update
	categoriesBefore, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	categoriesCountBefore := len(categoriesBefore)

	// Update the category
	req := categoryDTO.UpdateCategoryRequest{
		Name:               "Updated Category With Assessments",
		ShortName:          "UCWA",
		Description:        "This update should trigger schema copy",
		Weight:             10,
		AssessmentSchemaID: originalSchemaID,
	}

	err = UpdateCategory(suite.suiteCtx, categoryID, currentPhaseID, req)
	assert.NoError(suite.T(), err, "Updating category should not produce an error")

	// Count schemas after update - should have one more
	schemasAfter, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountAfter := len(schemasAfter)

	assert.Equal(suite.T(), schemasCountBefore+1, schemasCountAfter,
		"A new schema should be created when there are assessments in other phases")

	// Count categories after update - should have original count + copies from new schema
	categoriesAfter, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	categoriesCountAfter := len(categoriesAfter)

	// We had 2 categories in original schema, so new schema should have 2 more
	assert.Equal(suite.T(), categoriesCountBefore+2, categoriesCountAfter,
		"New schema should have copies of all categories")

	// Verify the course phase config still points to the ORIGINAL schema (owner keeps original)
	config, err := coursePhaseConfig.GetCoursePhaseConfig(suite.suiteCtx, currentPhaseID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), originalSchemaID, config.AssessmentSchemaID,
		"Owner's course phase config should still point to original schema")

	// Verify the original category was updated with new values (owner modifies original)
	originalCategory, err := GetCategory(suite.suiteCtx, categoryID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), req.Name, originalCategory.Name,
		"Original category should be updated with new name")
	assert.Equal(suite.T(), req.Weight, originalCategory.Weight,
		"Original category should be updated with new weight")
	assert.Equal(suite.T(), originalSchemaID, originalCategory.AssessmentSchemaID,
		"Original category should still belong to original schema")

	// Verify the other phase (Phase 4 - consumer) got a NEW copied schema
	otherPhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000004")
	otherPhaseConfig, err := coursePhaseConfig.GetCoursePhaseConfig(suite.suiteCtx, otherPhaseID)
	assert.NoError(suite.T(), err)
	copiedSchemaID := otherPhaseConfig.AssessmentSchemaID
	assert.NotEqual(suite.T(), originalSchemaID, copiedSchemaID,
		"Consumer phase should now use a copied schema")

	// Verify the copied schema exists and has a proper name
	copiedSchema, err := assessmentSchemas.GetAssessmentSchema(suite.suiteCtx, copiedSchemaID)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), copiedSchema.Name, "Test Schema 2",
		"Copied schema name should be based on original schema")

	// Verify the category in the copied schema has the OLD values (before update)
	allCategories, err := ListCategories(suite.suiteCtx)
	assert.NoError(suite.T(), err)

	// Filter categories in copied schema
	var categoriesInCopiedSchema []db.Category
	for _, cat := range allCategories {
		if cat.AssessmentSchemaID == copiedSchemaID {
			categoriesInCopiedSchema = append(categoriesInCopiedSchema, cat)
		}
	}
	assert.Equal(suite.T(), 2, len(categoriesInCopiedSchema),
		"Copied schema should have all categories from original")

	// Find the category that corresponds to the one we updated
	var categoryInCopy *db.Category
	for i, cat := range categoriesInCopiedSchema {
		if cat.Name == "Test Category 2" { // Original name, not updated name
			categoryInCopy = &categoriesInCopiedSchema[i]
			break
		}
	}

	assert.NotNil(suite.T(), categoryInCopy, "Category copy should exist in copied schema")
	assert.Equal(suite.T(), "Test Category 2", categoryInCopy.Name,
		"Copied category should have original name")
	assert.Equal(suite.T(), int32(1), categoryInCopy.Weight,
		"Copied category should have original weight")
	assert.Equal(suite.T(), copiedSchemaID, categoryInCopy.AssessmentSchemaID,
		"Copied category should belong to copied schema")
}

// TestUpdateCategory_WithAssessmentsInSamePhase tests updating a category when there are
// assessments in the SAME course phase. In this case, the schema should NOT be copied.
func (suite *SchemaCopyTestSuite) TestUpdateCategory_WithAssessmentsInSamePhase() {
	// Use Phase 3 which has assessments in the same phase
	coursePhaseID := uuid.MustParse("10000000-0000-0000-0000-000000000003")
	categoryID := uuid.MustParse("20000000-0000-0000-0000-000000000004")       // Test Category 3
	originalSchemaID := uuid.MustParse("00000000-0000-0000-0000-000000000003") // Schema 3

	// Count schemas before update
	schemasBefore, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountBefore := len(schemasBefore)

	// Update the category
	req := categoryDTO.UpdateCategoryRequest{
		Name:               "Updated Category Same Phase",
		ShortName:          "UCSP",
		Description:        "Assessments in same phase, no copy",
		Weight:             3,
		AssessmentSchemaID: originalSchemaID,
	}

	err = UpdateCategory(suite.suiteCtx, categoryID, coursePhaseID, req)
	assert.NoError(suite.T(), err, "Updating category should not produce an error")

	// Count schemas after update - should be the same
	schemasAfter, err := assessmentSchemas.ListAssessmentSchemas(suite.suiteCtx)
	assert.NoError(suite.T(), err)
	schemasCountAfter := len(schemasAfter)

	assert.Equal(suite.T(), schemasCountBefore, schemasCountAfter,
		"No new schema should be created when assessments are only in the same phase")

	// Verify the category was updated directly
	updatedCategory, err := GetCategory(suite.suiteCtx, categoryID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), req.Name, updatedCategory.Name, "Category name should be updated")
	assert.Equal(suite.T(), req.Weight, updatedCategory.Weight, "Category weight should be updated")

	// Verify the category still belongs to the original schema
	assert.Equal(suite.T(), originalSchemaID, updatedCategory.AssessmentSchemaID,
		"Category should still belong to the original schema")

	// Verify course phase config still points to original schema
	config, err := coursePhaseConfig.GetCoursePhaseConfig(suite.suiteCtx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), originalSchemaID, config.AssessmentSchemaID,
		"Course phase config should still point to original schema")
}

func TestSchemaCopyTestSuite(t *testing.T) {
	suite.Run(t, new(SchemaCopyTestSuite))
}
