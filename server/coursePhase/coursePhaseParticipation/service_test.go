package coursePhaseParticipation

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation/coursePhaseParticipationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/testutils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CoursePhaseParticipationTestSuite struct {
	suite.Suite
	ctx                             context.Context
	cleanup                         func()
	coursePhaseParticipationService CoursePhaseParticipationService
}

func (suite *CoursePhaseParticipationTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../../database_dumps/full_db.sql")
	if err != nil {
		log.Fatalf("Failed to set up test database: %v", err)
	}

	suite.cleanup = cleanup
	suite.coursePhaseParticipationService = CoursePhaseParticipationService{
		queries: *testDB.Queries,
		conn:    testDB.Conn,
	}
	CoursePhaseParticipationServiceSingleton = &suite.coursePhaseParticipationService
}

func (suite *CoursePhaseParticipationTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CoursePhaseParticipationTestSuite) TestGetAllParticipationsForCoursePhase() {
	coursePhaseID := uuid.MustParse("4e736d05-c125-48f0-8fa0-848b03ca6908")

	participations, err := GetAllParticipationsForCoursePhase(suite.ctx, coursePhaseID)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(participations), 0, "Expected participations for the course phase")
}

func (suite *CoursePhaseParticipationTestSuite) TestCreateCoursePhaseParticipation() {
	jsonData := `{"a": "b"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	newParticipation := coursePhaseParticipationDTO.CreateCoursePhaseParticipation{
		CoursePhaseID:         uuid.MustParse("4e736d05-c125-48f0-8fa0-848b03ca6908"),
		CourseParticipationID: uuid.MustParse("ca41772a-e06d-40eb-9c4b-ab44e06a890c"),
		PassStatus:            db.NullPassStatus{PassStatus: "passed", Valid: true},
		MetaData:              metaData,
	}

	createdParticipation, err := CreateCoursePhaseParticipation(suite.ctx, nil, newParticipation)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newParticipation.CoursePhaseID, createdParticipation.CoursePhaseID, "CoursePhaseID should match")
	assert.Equal(suite.T(), newParticipation.MetaData, createdParticipation.MetaData, "Meta data should match")
	assert.Equal(suite.T(), "passed", createdParticipation.PassStatus, "PassStatus should match")
}

func (suite *CoursePhaseParticipationTestSuite) TestUpdateCoursePhaseParticipation() {
	participationID := uuid.MustParse("83d88b1f-1435-4c36-b8ca-6741094f35e4")
	jsonData := `{"other-value": "some skills"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	updatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
		ID:         participationID,
		MetaData:   metaData,
		PassStatus: db.NullPassStatus{PassStatus: "passed", Valid: true},
	}

	err = UpdateCoursePhaseParticipation(suite.ctx, nil, updatedParticipation)
	assert.NoError(suite.T(), err)
	result, err := GetCoursePhaseParticipation(suite.ctx, participationID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, result.ID, "Participation ID should match")
	assert.Equal(suite.T(), "passed", result.PassStatus, "PassStatus should match")
	assert.Equal(suite.T(), updatedParticipation.MetaData["other-value"], result.MetaData["other-value"], "New Meta data should match")
}

func (suite *CoursePhaseParticipationTestSuite) TestUpdateCoursePhaseParticipationWithMetaDataOverride() {
	participationID := uuid.MustParse("83d88b1f-1435-4c36-b8ca-6741094f35e4")
	jsonData := `{"skills": "more than none", "other-value": "some skills"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	updatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
		ID:         participationID,
		MetaData:   metaData,
		PassStatus: db.NullPassStatus{Valid: false}, // Updated to use the ENUM value
	}

	BeforeResult, err := GetCoursePhaseParticipation(suite.ctx, participationID)
	assert.NoError(suite.T(), err)

	err = UpdateCoursePhaseParticipation(suite.ctx, nil, updatedParticipation)
	assert.NoError(suite.T(), err)
	result, err := GetCoursePhaseParticipation(suite.ctx, participationID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, result.ID, "Participation ID should match")
	assert.Equal(suite.T(), BeforeResult.PassStatus, result.PassStatus, "PassStatus should match")
	for key, value := range updatedParticipation.MetaData {
		assert.Equal(suite.T(), result.MetaData[key], value, "Updated Meta data should be stored")
	}
}

func TestCoursePhaseParticipationTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseParticipationTestSuite))
}
