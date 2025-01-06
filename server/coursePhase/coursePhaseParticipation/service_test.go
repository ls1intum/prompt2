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
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../../database_dumps/course_phase_participation_test.sql")
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
	coursePhaseID := uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b")

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
		CoursePhaseID:         uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b"),
		CourseParticipationID: uuid.MustParse("65dcc535-a9ab-4421-a2bc-0f09780ca59e"),
		PassStatus:            db.NullPassStatus{PassStatus: "passed", Valid: true},
		MetaData:              metaData,
	}

	createdParticipation, err := CreateCoursePhaseParticipation(suite.ctx, newParticipation)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newParticipation.CoursePhaseID, createdParticipation.CoursePhaseID, "CoursePhaseID should match")
	assert.Equal(suite.T(), newParticipation.MetaData, createdParticipation.MetaData, "Meta data should match")
	assert.Equal(suite.T(), "passed", createdParticipation.PassStatus, "PassStatus should match")
}

func (suite *CoursePhaseParticipationTestSuite) TestUpdateCoursePhaseParticipation() {
	participationID := uuid.MustParse("7698f081-df55-4136-a58c-1a166bb1bbda")
	jsonData := `{"other-value": "some skills"}`
	var metaData meta.MetaData
	err := json.Unmarshal([]byte(jsonData), &metaData)
	assert.NoError(suite.T(), err)

	updatedParticipation := coursePhaseParticipationDTO.UpdateCoursePhaseParticipation{
		ID:         participationID,
		MetaData:   metaData,
		PassStatus: db.NullPassStatus{PassStatus: "passed", Valid: true},
	}

	err = UpdateCoursePhaseParticipation(suite.ctx, updatedParticipation)
	assert.NoError(suite.T(), err)
	result, err := GetCoursePhaseParticipation(suite.ctx, participationID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, result.ID, "Participation ID should match")
	assert.Equal(suite.T(), "passed", result.PassStatus, "PassStatus should match")
	assert.Equal(suite.T(), updatedParticipation.MetaData["other-value"], result.MetaData["other-value"], "New Meta data should match")
}

func (suite *CoursePhaseParticipationTestSuite) TestUpdateCoursePhaseParticipationWithMetaDataOverride() {
	participationID := uuid.MustParse("7698f081-df55-4136-a58c-1a166bb1bbda")
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

	err = UpdateCoursePhaseParticipation(suite.ctx, updatedParticipation)
	assert.NoError(suite.T(), err)
	result, err := GetCoursePhaseParticipation(suite.ctx, participationID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), updatedParticipation.ID, result.ID, "Participation ID should match")
	assert.Equal(suite.T(), BeforeResult.PassStatus, result.PassStatus, "PassStatus should match")
	assert.Equal(suite.T(), updatedParticipation.MetaData, result.MetaData, "New Meta data should match")
}

func TestCoursePhaseParticipationTestSuite(t *testing.T) {
	suite.Run(t, new(CoursePhaseParticipationTestSuite))
}
