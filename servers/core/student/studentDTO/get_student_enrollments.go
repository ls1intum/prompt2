package studentDTO

import (
  "encoding/json"
  "time"

  "github.com/google/uuid"
  "github.com/jackc/pgx/v5/pgtype"

  db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type CoursePhaseTypeDTO struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type CoursePhaseEnrollmentDTO struct {
	CoursePhaseID         uuid.UUID          `json:"coursePhaseId"`
	Name                  string             `json:"name"`
	IsInitialPhase        bool               `json:"isInitialPhase"`
	CoursePhaseType       CoursePhaseTypeDTO `json:"coursePhaseType"`
	PassStatus            *string            `json:"passStatus"`
	LastModified          *string            `json:"lastModified"`
}

type CourseEnrollmentDTO struct {
	CourseID              uuid.UUID             `json:"courseId"`
	Name                  string                `json:"name"`
	SemesterTag           string                `json:"semesterTag"`
	CourseType            string                `json:"courseType"`
	Ects                  int32                 `json:"ects"`
	StartDate             *time.Time            `json:"startDate"`
	EndDate               *time.Time            `json:"endDate"`
	LongDescription       *string               `json:"longDescription"`
  StudentReadableData   json.RawMessage       `json:"studentReadableData"`
	CoursePhases    []CoursePhaseEnrollmentDTO  `json:"coursePhases"`
}

type StudentEnrollmentsDTO struct {
	ID                    uuid.UUID    `json:"id"`
	FirstName             string       `json:"firstName"`
	LastName              string       `json:"lastName"`
	Email                 string       `json:"email"`
	MatriculationNumber   string       `json:"matriculationNumber"`
	UniversityLogin       string       `json:"universityLogin"`
	HasUniversityAccount  bool         `json:"hasUniversityAccount"`
	Gender                string       `json:"gender"`
	Nationality           string       `json:"nationality"`
	StudyProgram          string       `json:"studyProgram"`
	StudyDegree           string       `json:"studyDegree"`
	CurrentSemester       pgtype.Int4  `json:"currentSemester" swaggertype:"integer"`

	Courses []CourseEnrollmentDTO `json:"courses"`
}

func GetStudentEnrollmentsFromDB(
	row db.GetStudentEnrollmentsRow,
) (StudentEnrollmentsDTO, error) {

	var courses []CourseEnrollmentDTO
	if err := json.Unmarshal(row.Courses, &courses); err != nil {
		return StudentEnrollmentsDTO{}, err
	}

  return StudentEnrollmentsDTO{
    ID:                   row.StudentID,
    FirstName:            row.FirstName.String,
    LastName:             row.LastName.String,
    Email:                row.Email.String,
    MatriculationNumber:  row.MatriculationNumber.String,
    UniversityLogin:      row.UniversityLogin.String,
    HasUniversityAccount: row.HasUniversityAccount.Bool,
    Gender:               string(row.Gender),
    Nationality:          row.Nationality.String,
    StudyProgram:         row.StudyProgram.String,
    StudyDegree:          string(row.StudyDegree),
    CurrentSemester:      row.CurrentSemester,
    Courses:              courses,
  }, nil
}

