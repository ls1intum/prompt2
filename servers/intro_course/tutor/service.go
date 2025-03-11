package tutors

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/tutor/tutorDTO"
)

type TutorService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TutorServiceSingleton *TutorService

func ImportTutors(ctx context.Context, coursePhaseID string, tutors []tutorDTO.Tutor) error {
	// add students to the keycloak group

	tx, err := TutorServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := TutorServiceSingleton.queries.WithTx(tx)

	for _, tutor := range tutors {
		// store tutor in database
		_, err := qtx.CreateTutor(coursePhaseID, tutor.ID, tutor.FirstName, tutor.LastName, tutor.Email, tutor.MatriculationNumber, tutor.UniversityLogin)
		if err != nil {
			return err
		}

		// add tutor to custom keycloak group

		// add tutor to editor group
	}
	return nil
}
