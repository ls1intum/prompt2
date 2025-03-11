package tutor

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/tutor/tutorDTO"
)

type TutorService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TutorServiceSingleton *TutorService

func ImportTutors(ctx context.Context, coursePhaseID uuid.UUID, tutors []tutorDTO.Tutor) error {
	// add students to the keycloak group
	tx, err := TutorServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := TutorServiceSingleton.queries.WithTx(tx)

	for _, tutor := range tutors {
		// store tutor in database
		err := qtx.CreateTutor(ctx, db.CreateTutorParams{
			CoursePhaseID:       coursePhaseID,
			ID:                  tutor.ID,
			FirstName:           tutor.FirstName,
			LastName:            tutor.LastName,
			Email:               tutor.Email,
			MatriculationNumber: tutor.MatriculationNumber,
			UniversityLogin:     tutor.UniversityLogin,
		})
		if err != nil {
			return err
		}
	}
	return nil
}
