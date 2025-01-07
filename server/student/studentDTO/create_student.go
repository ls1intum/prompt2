package studentDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CreateStudent struct {
	ID                   uuid.UUID `json:"id"`
	FirstName            string    `json:"first_name"`
	LastName             string    `json:"last_name"`
	Email                string    `json:"email"`
	MatriculationNumber  string    `json:"matriculation_number"`
	UniversityLogin      string    `json:"university_login"`
	HasUniversityAccount bool      `json:"has_university_account"`
	Gender               db.Gender `json:"gender"`
	Nationality          string    `json:"nationality"`
}

func (c CreateStudent) GetDBModel() db.CreateStudentParams {
	return db.CreateStudentParams{
		FirstName:            pgtype.Text{String: c.FirstName, Valid: true},
		LastName:             pgtype.Text{String: c.LastName, Valid: true},
		Email:                pgtype.Text{String: c.Email, Valid: true},
		MatriculationNumber:  pgtype.Text{String: c.MatriculationNumber, Valid: true},
		UniversityLogin:      pgtype.Text{String: c.UniversityLogin, Valid: true},
		HasUniversityAccount: pgtype.Bool{Bool: c.HasUniversityAccount, Valid: true},
		Gender:               c.Gender,
		Nationality:          pgtype.Text{String: c.Nationality, Valid: true},
	}
}
