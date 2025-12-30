package studentDTO

import (
  "encoding/json"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)


// for StudentWithCourses query
type StudentCourseParticipationDTO struct {
	CourseID            uuid.UUID `json:"courseId"`
	CourseName          string    `json:"courseName"`
	StudentReadableData map[string]any    `json:"studentReadableData"`
}

type StudentWithCourseParticipationsDTO struct {
	ID              uuid.UUID    `json:"id"`
	Name            string       `json:"name"`
	CurrentSemester pgtype.Int4  `json:"currentSemester" swaggertype:"integer"`
	StudyProgram    string       `json:"studyProgram"`

	Courses []StudentCourseParticipationDTO `json:"courses"`
}


func GetStudentWithCoursesFromDB (row db.GetAllStudentsWithCourseParticipationsRow) (StudentWithCourseParticipationsDTO, error) {
	var courses []StudentCourseParticipationDTO
	if err := json.Unmarshal(row.Courses, &courses); err != nil {
		return StudentWithCourseParticipationsDTO{}, err
	}

	return StudentWithCourseParticipationsDTO{
		ID:              row.StudentID,
		Name:            row.StudentName,
		CurrentSemester: row.CurrentSemester,
		StudyProgram:    row.StudyProgram.String,
		Courses:         courses,
	}, nil
}
