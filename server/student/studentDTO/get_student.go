package studentDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type Student struct {
	ID                   uuid.UUID `json:"id"`
	FirstName            string    `json:"first_name"`
	LastName             string    `json:"last_name"`
	Email                string    `json:"email"`
	MatriculationNumber  string    `json:"matriculation_number"`
	UniversityLogin      string    `json:"university_login"`
	HasUniversityAccount bool      `json:"has_university_account"`
	Gender               db.Gender `json:"gender"`
}

func GetStudentDTOFromDBModel(model db.Student) Student {
	return Student{
		ID:                   model.ID,
		FirstName:            model.FirstName.String,
		LastName:             model.LastName.String,
		Email:                model.Email.String,
		MatriculationNumber:  model.MatriculationNumber.String,
		UniversityLogin:      model.UniversityLogin.String,
		HasUniversityAccount: model.HasUniversityAccount.Bool,
		Gender:               model.Gender,
	}
}

func (s Student) GetDBModel() db.Student {
	return db.Student{
		ID:                   s.ID,
		FirstName:            pgtype.Text{String: s.FirstName, Valid: true},
		LastName:             pgtype.Text{String: s.LastName, Valid: true},
		Email:                pgtype.Text{String: s.Email, Valid: true},
		MatriculationNumber:  pgtype.Text{String: s.MatriculationNumber, Valid: true},
		UniversityLogin:      pgtype.Text{String: s.UniversityLogin, Valid: true},
		HasUniversityAccount: pgtype.Bool{Bool: s.HasUniversityAccount, Valid: true},
		Gender:               s.Gender,
	}
}
