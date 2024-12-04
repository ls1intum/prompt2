package coursePhase

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/testutils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CoursePhaseTestSuite struct {
	suite.Suite
	ctx                context.Context
	cleanup            func()
	coursePhaseService CoursePhaseService
}

func (suite *CoursePhaseTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/course_phase_test.sql")
	if err != nil {
		log.Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.coursePhaseService = CoursePhaseService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CoursePhaseServiceSingleton = &suite.coursePhaseService
}

func (suite *CoursePhaseTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CoursePhaseTestSuite) TestGetCoursePhaseByID() {
	id := uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b")
	coursePhase, err := GetCoursePhaseByID(suite.ctx, id)

	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Test", coursePhase.Name, "Expected course phase name to match")
	assert.False(suite.T(), coursePhase.IsInitialPhase, "Expected course phase to not be an initial phase")
	assert.Equal(suite.T(), id, coursePhase.ID, "Expected course phase ID to match")
}

func (suite *CoursePhaseTestSuite) TestUpdateCoursePhase() {
	id := uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b")
	jsonData := `{"updated_key": "updated_value"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	update := coursePhaseDTO.UpdateCoursePhase{
		ID:             id,
		Name:           "Updated Phase",
		IsInitialPhase: false,
		MetaData:       metaData,
	}

	err = UpdateCoursePhase(suite.ctx, update)
	assert.NoError(suite.T(), err)

	// Verify update
	updatedCoursePhase, err := GetCoursePhaseByID(suite.ctx, id)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Updated Phase", updatedCoursePhase.Name, "Expected updated course phase name to match")
	assert.False(suite.T(), updatedCoursePhase.IsInitialPhase, "Expected updated course phase to be an initial phase")
	assert.Equal(suite.T(), metaData, updatedCoursePhase.MetaData, "Expected metadata to match updated data")
}

func (suite *CoursePhaseTestSuite) TestCreateCoursePhase() {
	jsonData := `{"new_key": "new_value"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	newCoursePhase := coursePhaseDTO.CreateCoursePhase{
		CourseID:          uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e"),
		Name:              "New Phase",
		IsInitialPhase:    false,
		MetaData:          metaData,
		CoursePhaseTypeID: uuid.MustParse("7dc1c4e8-4255-4874-80a0-0c12b958744c"),
	}

	createdCoursePhase, err := CreateCoursePhase(suite.ctx, newCoursePhase)
	assert.NoError(suite.T(), err)

	// Verify creation
	fetchedCoursePhase, err := GetCoursePhaseByID(suite.ctx, createdCoursePhase.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "New Phase", fetchedCoursePhase.Name, "Expected course phase name to match")
	assert.False(suite.T(), fetchedCoursePhase.IsInitialPhase, "Expected course phase to not be an initial phase")
	assert.Equal(suite.T(), metaData, fetchedCoursePhase.MetaData, "Expected metadata to match")
}

func TestCoursePhaseTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseTestSuite))
}
