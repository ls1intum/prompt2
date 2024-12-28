package student

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/student/studentDTO"
)

type StudentService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var StudentServiceSingleton *StudentService

func GetAllStudents(ctx context.Context) ([]studentDTO.Student, error) {
	students, err := StudentServiceSingleton.queries.GetAllStudents(ctx)
	if err != nil {
		return nil, err
	}

	dtoStudents := make([]studentDTO.Student, 0, len(students))
	for _, student := range students {
		dtoStudents = append(dtoStudents, studentDTO.GetStudentDTOFromDBModel(student))
	}
	return dtoStudents, nil
}

func GetStudentByID(ctx context.Context, id uuid.UUID) (studentDTO.Student, error) {
	student, err := StudentServiceSingleton.queries.GetStudent(ctx, id)
	if err != nil {
		return studentDTO.Student{}, err
	}

	return studentDTO.GetStudentDTOFromDBModel(student), nil
}

func CreateStudent(ctx context.Context, student studentDTO.CreateStudent) (studentDTO.Student, error) {
	createStudentParams := student.GetDBModel()

	createStudentParams.ID = uuid.New()
	createdStudent, err := StudentServiceSingleton.queries.CreateStudent(ctx, createStudentParams)
	if err != nil {
		return studentDTO.Student{}, err
	}

	return studentDTO.GetStudentDTOFromDBModel(createdStudent), nil
}

func GetStudentByEmail(ctx context.Context, email string) (studentDTO.Student, error) {
	student, err := StudentServiceSingleton.queries.GetStudentByEmail(ctx, pgtype.Text{String: email, Valid: true})
	if err != nil {
		return studentDTO.Student{}, err
	}

	return studentDTO.GetStudentDTOFromDBModel(student), nil
}
