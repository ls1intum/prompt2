package course

import (
	"context"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/ls1intum/prompt2/servers/core/course/courseDTO"
	"github.com/ls1intum/prompt2/servers/core/coursePhase"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/meta"
	"github.com/ls1intum/prompt2/servers/core/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CopyCourseTestSuite struct {
	suite.Suite
	ctx           context.Context
	cleanup       func()
	courseService CourseService
	sourceCourse  db.Course
	phase1ID      uuid.UUID
	phase2ID      uuid.UUID
	dto1ID        uuid.UUID
	dto2ID        uuid.UUID
}

func (suite *CopyCourseTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/course_test.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}
	suite.cleanup = cleanup

	mockCreateGroupsAndRoles := func(ctx context.Context, courseName, iterationName, userID string) error {
		return nil
	}
	suite.courseService = CourseService{
		queries:                    *testDB.Queries,
		conn:                       testDB.Conn,
		createCourseGroupsAndRoles: mockCreateGroupsAndRoles,
	}
	CourseServiceSingleton = &suite.courseService

	router := gin.Default()
	coursePhase.InitCoursePhaseModule(router.Group("/api"), *testDB.Queries, testDB.Conn)

	// --- Create Course ---
	newCourse := courseDTO.CreateCourse{
		Name:                "Source Course",
		StartDate:           pgtype.Date{Time: time.Now(), Valid: true},
		EndDate:             pgtype.Date{Time: time.Now().Add(7 * 24 * time.Hour), Valid: true},
		SemesterTag:         pgtype.Text{String: "SS2025", Valid: true},
		RestrictedData:      meta.MetaData{},
		StudentReadableData: meta.MetaData{"bg-color": "bg-teal-100", "icon": "school"},
		CourseType:          db.CourseType("practical course"),
		Ects:                pgtype.Int4{Int32: 10, Valid: true},
	}
	course, err := CreateCourse(suite.ctx, newCourse, "setup_user")
	suite.Require().NoError(err)
	suite.sourceCourse = db.Course{ID: course.ID}

	// --- Create Phases ---
	tx, err := testDB.Conn.Begin(suite.ctx)
	suite.Require().NoError(err)
	qtx := testDB.Queries.WithTx(tx)

	coursePhaseTypeApplicationID := uuid.New()
	err = qtx.CreateCoursePhaseType(suite.ctx, db.CreateCoursePhaseTypeParams{
		ID:           coursePhaseTypeApplicationID,
		Name:         "Application",
		InitialPhase: true,
		BaseUrl:      "/api/application",
	})
	suite.Require().NoError(err)

	// Phase 1 (Application Phase)
	phase1ID := uuid.New()
	_, phase1Err := qtx.CreateCoursePhase(suite.ctx, db.CreateCoursePhaseParams{
		ID:                phase1ID,
		CourseID:          suite.sourceCourse.ID,
		Name:              pgtype.Text{String: "Application", Valid: true},
		CoursePhaseTypeID: coursePhaseTypeApplicationID,
		IsInitialPhase:    true,
		RestrictedData: []byte(`{
			"applicationEndDate": "2025-06-01T23:59:00+02:00",
			"applicationStartDate": "2025-05-19T00:00:00+02:00",
			"autoAccept": true,
			"externalStudentsAllowed": false,
			"universityLoginAvailable": true
		}`),
		StudentReadableData: []byte(`{}`),
	})
	suite.Require().NoError(phase1Err)

	coursePhaseTypeInterviewID := uuid.New()
	err = qtx.CreateCoursePhaseType(suite.ctx, db.CreateCoursePhaseTypeParams{
		ID:           coursePhaseTypeInterviewID,
		Name:         "Interview",
		InitialPhase: false,
		BaseUrl:      "/api/interview",
	})
	suite.Require().NoError(err)

	// Phase 2 (Interview Phase)
	phase2ID := uuid.New()
	_, phase2Err := qtx.CreateCoursePhase(suite.ctx, db.CreateCoursePhaseParams{
		ID:                phase2ID,
		CourseID:          suite.sourceCourse.ID,
		Name:              pgtype.Text{String: "Interview", Valid: true},
		CoursePhaseTypeID: coursePhaseTypeInterviewID,
		IsInitialPhase:    false,
		RestrictedData: []byte(`{
        "interviewQuestions": [
            {
                "id": 1747661413157,
                "orderNum": 0,
                "question": "Question 1"
            },
            {
                "id": 1747661417361,
                "orderNum": 1,
                "question": "Question 2"
            }
        ]
    }`),
		StudentReadableData: []byte(`{}`),
	})
	suite.Require().NoError(phase2Err)

	// Phase graph: phase1 -> phase2
	err = qtx.CreateCourseGraphConnection(suite.ctx, db.CreateCourseGraphConnectionParams{
		FromCoursePhaseID: phase1ID,
		ToCoursePhaseID:   phase2ID,
	})
	suite.Require().NoError(err)

	// --- Create DTOs ---
	dto1ID := uuid.New()
	dto2ID := uuid.New()

	err = qtx.CreateCoursePhaseTypeProvidedOutput(suite.ctx, db.CreateCoursePhaseTypeProvidedOutputParams{
		ID:                dto1ID,
		CoursePhaseTypeID: coursePhaseTypeInterviewID,
		DtoName:           "score",
		VersionNumber:     1,
		EndpointPath:      "/api/score",
		Specification:     []byte(`{"type": "integer"}`),
	})
	suite.Require().NoError(err)

	err = qtx.CreateCoursePhaseTypeRequiredInput(suite.ctx, db.CreateCoursePhaseTypeRequiredInputParams{
		ID:                dto2ID,
		CoursePhaseTypeID: coursePhaseTypeInterviewID,
		DtoName:           "feedback",
		Specification:     []byte(`{"type": "string"}`),
	})
	suite.Require().NoError(err)

	// --- Add Metadata Graphs ---
	err = qtx.CreatePhaseDataConnection(suite.ctx, db.CreatePhaseDataConnectionParams{
		FromCoursePhaseID:    phase1ID,
		ToCoursePhaseID:      phase2ID,
		FromCoursePhaseDtoID: dto1ID,
		ToCoursePhaseDtoID:   dto2ID,
	})
	suite.Require().NoError(err)

	err = qtx.CreateParticipationDataConnection(suite.ctx, db.CreateParticipationDataConnectionParams{
		FromCoursePhaseID:    phase1ID,
		ToCoursePhaseID:      phase2ID,
		FromCoursePhaseDtoID: dto1ID,
		ToCoursePhaseDtoID:   dto2ID,
	})
	suite.Require().NoError(err)

	suite.Require().NoError(tx.Commit(suite.ctx))

	suite.phase1ID = phase1ID
	suite.phase2ID = phase2ID
	suite.dto1ID = dto1ID
	suite.dto2ID = dto2ID
}

func (suite *CopyCourseTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CopyCourseTestSuite) TestFullCourseCopy() {
	newCourseName := "Copied Course"
	copyVars := courseDTO.CopyCourse{
		Name:        newCourseName,
		SemesterTag: pgtype.Text{String: "SS2025", Valid: true},
	}

	copied, err := CopyCourse(suite.ctx, suite.sourceCourse.ID, copyVars, "copy_user")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newCourseName, copied.Name)

	copiedPhases, err := suite.courseService.queries.GetAllCoursePhaseForCourse(suite.ctx, copied.ID)
	assert.NoError(suite.T(), err)

	// Course phases copied
	assert.Len(suite.T(), copiedPhases, 2)

	// Graph copied
	graph, err := GetCoursePhaseGraph(suite.ctx, copied.ID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), graph, 1)

	// DTO graphs copied
	phaseGraph, err := GetPhaseDataGraph(suite.ctx, copied.ID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), phaseGraph, 1)

	participationGraph, err := GetParticipationDataGraph(suite.ctx, copied.ID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), participationGraph, 1)
}

func TestCopyCourseTestSuite(t *testing.T) {
	suite.Run(t, new(CopyCourseTestSuite))
}
