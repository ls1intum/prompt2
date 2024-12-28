package student

import (
	"context"
	"database/sql"
	"errors"

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

func UpdateStudent(ctx context.Context, id uuid.UUID, student studentDTO.Student) (studentDTO.Student, error) {
	updateStudentParams := student.GetDBModel()

	updatedStudent, err := StudentServiceSingleton.queries.UpdateStudent(ctx, db.UpdateStudentParams(updateStudentParams))
	if err != nil {
		return studentDTO.Student{}, err
	}

	return studentDTO.GetStudentDTOFromDBModel(updatedStudent), nil
}

func CreateOrUpdateStudent(ctx context.Context, studentObj studentDTO.CreateStudent) (studentDTO.Student, error) {
	studentByEmail, err := GetStudentByEmail(ctx, studentObj.Email)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		return CreateStudent(ctx, studentObj)
	}
	if err != nil {
		return studentDTO.Student{}, err
	}

	// student exists
	if studentObj.ID != uuid.Nil && studentByEmail.ID != studentObj.ID {
		return studentDTO.Student{}, errors.New("student has wrong ID")
	} else {
		return UpdateStudent(ctx, studentByEmail.ID, studentDTO.Student{
			ID:                   studentByEmail.ID, // make sure the id is not overwritten
			FirstName:            studentObj.FirstName,
			LastName:             studentObj.LastName,
			Email:                studentByEmail.Email,
			MatriculationNumber:  studentObj.MatriculationNumber,
			UniversityLogin:      studentObj.UniversityLogin,
			HasUniversityAccount: studentObj.HasUniversityAccount,
			Gender:               studentObj.Gender,
		})
	}
}
