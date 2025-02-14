package course

import (
	"context"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/niclasheun/prompt2.0/course/courseDTO"
	"github.com/niclasheun/prompt2.0/coursePhase"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	"github.com/niclasheun/prompt2.0/testutils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CourseTestSuite struct {
	testutils.DatabaseSuite
	router        *gin.Engine
	ctx           context.Context
	courseService CourseService
}

func (suite *CourseTestSuite) SetupSuite() {
	suite.ctx = context.Background()
	suite.DatabaseSuite.SetupSuite()

	err := testutils.RunSQLDump(suite.DatabaseSuite.Conn, "../database_dumps/course_test.sql")
	suite.Require().NoError(err)

	queries := db.New(suite.DatabaseSuite.Conn)

	suite.courseService = CourseService{
		queries: *queries,
		conn:    suite.DatabaseSuite.Conn,
	}

	CourseServiceSingleton = &suite.courseService
	suite.router = gin.Default()
}

func (suite *CourseTestSuite) TearDownSuite() {
	suite.DatabaseSuite.TearDownSuite()
}

func (suite *CourseTestSuite) TestValidateCreateCourse() {
	tests := []struct {
		name          string
		input         courseDTO.CreateCourse
		expectedError string
	}{
		{
			name: "valid course",
			input: courseDTO.CreateCourse{
				Name:                "Valid Course",
				StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
				EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
				SemesterTag:         pgtype.Text{String: "WS2024", Valid: true},
				RestrictedData:      meta.MetaData{"key": "value"},
				StudentReadableData: meta.MetaData{"differentKey": "value"},
				CourseType:          "practical course",
				Ects:                pgtype.Int4{Int32: 10, Valid: true},
			},
			expectedError: "",
		},
		{
			name: "missing course name",
			input: courseDTO.CreateCourse{
				Name:                "",
				StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
				EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
				SemesterTag:         pgtype.Text{String: "WS2024", Valid: true},
				RestrictedData:      meta.MetaData{"key": "value"},
				StudentReadableData: meta.MetaData{"differentKey": "value"},
				CourseType:          "practical course",
				Ects:                pgtype.Int4{Int32: 10, Valid: true},
			},
			expectedError: "course name is required",
		},
		{
			name: "start date after end date",
			input: courseDTO.CreateCourse{
				Name:                "Invalid Date Course",
				StartDate:           pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
				EndDate:             pgtype.Date{Valid: true, Time: time.Now()},
				SemesterTag:         pgtype.Text{String: "WS2024", Valid: true},
				RestrictedData:      meta.MetaData{"key": "value"},
				StudentReadableData: meta.MetaData{"differentKey": "value"},
				CourseType:          "practical course",
				Ects:                pgtype.Int4{Int32: 10, Valid: true},
			},
			expectedError: "start date must be before end date",
		},
		{
			name: "missing semester tag",
			input: courseDTO.CreateCourse{
				Name:                "Invalid Semester Tag",
				StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
				EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
				SemesterTag:         pgtype.Text{String: "", Valid: false},
				RestrictedData:      meta.MetaData{"key": "value"},
				StudentReadableData: meta.MetaData{"differentKey": "value"},
				CourseType:          "practical course",
				Ects:                pgtype.Int4{Int32: 10, Valid: true},
			},
			expectedError: "semester tag is required",
		},
		{
			name: "missing course type",
			input: courseDTO.CreateCourse{
				Name:                "Invalid Course Type",
				StartDate:           pgtype.Date{Valid: true, Time: time.Now()},
				EndDate:             pgtype.Date{Valid: true, Time: time.Now().Add(24 * time.Hour)},
				SemesterTag:         pgtype.Text{String: "ios2425", Valid: true},
				RestrictedData:      meta.MetaData{"key": "value"},
				StudentReadableData: meta.MetaData{"differentKey": "value"},
				CourseType:          "",
				Ects:                pgtype.Int4{Int32: 10, Valid: true},
			},
			expectedError: "course type is required",
		},
	}

	for _, tt := range tests {
		suite.T().Run(tt.name, func(t *testing.T) {
			err := validateCreateCourse(tt.input)
			if tt.expectedError == "" {
				assert.NoError(t, err)
			} else {
				assert.Error(t, err)
				assert.EqualError(t, err, tt.expectedError)
			}
		})
	}
}

func (suite *CourseTestSuite) TestValidateUpdateCourseOrder() {
	// set up CoursePhaseService
	coursePhase.InitCoursePhaseModule(suite.router.Group("/api"), suite.courseService.queries, suite.courseService.conn)

	tests := []struct {
		name          string
		courseID      uuid.UUID
		orderedPhases []uuid.UUID
		expectedError string
	}{
		{
			name:     "valid course phase order",
			courseID: uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e"),
			orderedPhases: []uuid.UUID{
				uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411b"),
				uuid.MustParse("92bb0532-39e5-453d-bc50-fa61ea0128b2"),
			},
			expectedError: "",
		},
		// Example of a failing test:
		// {
		// 	name:     "invalid course ID in phase",
		// 	courseID: uuid.MustParse("3f42d322-e5bf-4faa-b576-51f2cab14c2e"),
		// 	orderedPhases: []uuid.UUID{
		// 		uuid.MustParse("3d1f3b00-87f3-433b-a713-178c4050411c"),
		// 	},
		// 	expectedError: "course id must be the same for all course phases",
		// },
	}

	for _, tt := range tests {
		suite.T().Run(tt.name, func(t *testing.T) {
			// Convert orderedPhases to a slice of CoursePhaseGraph entries
			var phaseGraph []courseDTO.CoursePhaseGraph
			for _, phaseID := range tt.orderedPhases {
				phaseGraph = append(phaseGraph, courseDTO.CoursePhaseGraph{
					FromCoursePhaseID: uuid.Nil, // or another valid UUID if needed
					ToCoursePhaseID:   phaseID,
				})
			}

			err := validateUpdateCourseOrder(context.Background(), tt.courseID, phaseGraph)
			if tt.expectedError == "" {
				assert.NoError(t, err, "Expected no error, got %v", err)
			} else {
				assert.Error(t, err, "Expected an error but got none")
				assert.EqualError(t, err, tt.expectedError, "Error message did not match")
			}
		})
	}
}

func TestCourseTestSuite(t *testing.T) {
	suite.Run(t, new(CourseTestSuite))
}
