package course

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseDTO"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CourseRouterTestSuite struct {
	suite.Suite
	router        *gin.Engine
	ctx           context.Context
	cleanup       func()
	courseService CourseService
}

func (suite *CourseRouterTestSuite) SetupSuite() {
	suite.ctx = context.Background()

	// Set up PostgreSQL container
	testDB, cleanup, err := testutils.SetupTestDB(suite.ctx, "../database_dumps/course_test.sql")
	if err != nil {
		suite.T().Fatalf("Failed to set up test database: %v", err)
	}

	mockCreateGroupsAndRoles := func(ctx context.Context, courseName, iterationName, userID string) error {
		// No-op or add assertions for test
		return nil
	}

	suite.cleanup = cleanup
	suite.courseService = CourseService{
		queries:                    *testDB.Queries,
		conn:                       testDB.Conn,
		createCourseGroupsAndRoles: mockCreateGroupsAndRoles,
	}

	CourseServiceSingleton = &suite.courseService

	// Init the permissionValidation service
	permissionValidation.InitValidationService(*testDB.Queries, testDB.Conn)

	// Initialize router
	suite.router = gin.Default()
	api := suite.router.Group("/api")
	setupCourseRouter(api, func() gin.HandlerFunc {
		return testutils.MockAuthMiddleware([]string{"PROMPT_Admin", "iPraktikum-ios24245-Lecturer"})
	}, testutils.MockPermissionMiddleware, testutils.MockPermissionMiddleware)
	coursePhase.InitCoursePhaseModule(api, *testDB.Queries, testDB.Conn)
}

func (suite *CourseRouterTestSuite) TearDownSuite() {
	suite.cleanup()
}

func (suite *CourseRouterTestSuite) TestGetAllCourses() {
	req, _ := http.NewRequest("GET", "/api/courses/", nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var courses []courseDTO.CourseWithPhases
	err := json.Unmarshal(resp.Body.Bytes(), &courses)
	assert.NoError(suite.T(), err)
	assert.Greater(suite.T(), len(courses), 0, "Expected at least one course")
}

func (suite *CourseRouterTestSuite) TestGetCourseByID() {
	courseID := "3f42d322-e5bf-4faa-b576-51f2cab14c2e"
	req, _ := http.NewRequest("GET", "/api/courses/"+courseID, nil)
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code)

	var course courseDTO.CourseWithPhases
	err := json.Unmarshal(resp.Body.Bytes(), &course)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), uuid.MustParse(courseID), course.ID, "Course ID should match")
	assert.NotEmpty(suite.T(), course.CoursePhases, "Course should have phases")
}

func (suite *CourseRouterTestSuite) TestCreateCourse() {
	newCourse := courseDTO.CreateCourse{
		Name:                "Router Test Course",
		StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
		EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
		SemesterTag:         pgtype.Text{String: "WS2024", Valid: true},
		RestrictedData:      meta.MetaData{"key": "value"},
		StudentReadableData: meta.MetaData{"icon": "test-icon"},
		CourseType:          "practical course",
		Ects:                pgtype.Int4{Int32: 10, Valid: true},
	}
	body, _ := json.Marshal(newCourse)
	req, _ := http.NewRequest("POST", "/api/courses/", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusCreated, resp.Code)

	var createdCourse courseDTO.Course
	err := json.Unmarshal(resp.Body.Bytes(), &createdCourse)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), newCourse.Name, createdCourse.Name, "Course name should match")
	assert.Equal(suite.T(), "practical course", createdCourse.CourseType, "Course type should match")
}

func (suite *CourseRouterTestSuite) TestUpdateCoursePhaseOrder() {
	courseID := "3f42d322-e5bf-4faa-b576-51f2cab14c2e"
	firstUUID := uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b")
	secondUUID := uuid.MustParse("500db7ed-2eb2-42d0-82b3-8750e12afa8a")
	thirdUUID := uuid.MustParse("92bb0532-39e5-453d-bc50-fa61ea0128b2")

	// Construct the updated phase graph: first -> second -> third
	updateGraphRequest := courseDTO.UpdateCoursePhaseGraph{
		InitialPhase: firstUUID,
		PhaseGraph: []courseDTO.CoursePhaseGraph{
			{
				FromCoursePhaseID: firstUUID,
				ToCoursePhaseID:   secondUUID,
			},
			{
				FromCoursePhaseID: secondUUID,
				ToCoursePhaseID:   thirdUUID,
			},
		},
	}

	body, _ := json.Marshal(updateGraphRequest)
	req, _ := http.NewRequest("PUT", "/api/courses/"+courseID+"/phase_graph", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code, "Expected 200 OK when updating course phase graph")

	// Verify the updated order by fetching the course again
	req, _ = http.NewRequest("GET", "/api/courses/"+courseID, nil)
	resp = httptest.NewRecorder()
	suite.router.ServeHTTP(resp, req)

	assert.Equal(suite.T(), http.StatusOK, resp.Code, "Expected 200 OK when fetching the updated course")

	var updatedCourse courseDTO.CourseWithPhases
	err := json.Unmarshal(resp.Body.Bytes(), &updatedCourse)
	assert.NoError(suite.T(), err, "Unmarshalling the response should not produce an error")

	// Validate the phases in the updated course
	var firstCoursePhase *coursePhaseDTO.CoursePhaseSequence
	var secondCoursePhase *coursePhaseDTO.CoursePhaseSequence
	var thirdCoursePhase *coursePhaseDTO.CoursePhaseSequence

	for _, phase := range updatedCourse.CoursePhases {
		switch phase.SequenceOrder {
		case 1:
			firstCoursePhase = &phase
		case 2:
			secondCoursePhase = &phase
		case 3:
			thirdCoursePhase = &phase
		}
	}

	assert.NotNil(suite.T(), firstCoursePhase, "First phase should be present")
	assert.NotNil(suite.T(), secondCoursePhase, "Second phase should be present")
	assert.NotNil(suite.T(), thirdCoursePhase, "Third phase should be present")

	assert.Equal(suite.T(), firstUUID, firstCoursePhase.ID, "First phase ID should match initial phase")
	assert.Equal(suite.T(), secondUUID, secondCoursePhase.ID, "Second phase ID should match")
	assert.Equal(suite.T(), thirdUUID, thirdCoursePhase.ID, "Third phase ID should match")

	assert.True(suite.T(), firstCoursePhase.IsInitialPhase, "First phase should be the initial phase")
	assert.False(suite.T(), secondCoursePhase.IsInitialPhase, "Second phase should not be the initial phase")
	assert.False(suite.T(), thirdCoursePhase.IsInitialPhase, "Third phase should not be the initial phase")
}

func TestCourseRouterTestSuite(t *testing.T) {
	suite.Run(t, new(CourseRouterTestSuite))
}
