package developerProfile

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile/developerProfileDTO"
	log "github.com/sirupsen/logrus"
)

type DeveloperProfileService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var DeveloperProfileServiceSingleton *DeveloperProfileService

func CreateDeveloperProfile(ctx context.Context, coursePhaseID uuid.UUID, courseParticipationID uuid.UUID, request developerProfileDTO.PostDeveloperProfile) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	params := developerProfileDTO.GetDeveloperProfileDTOFromPostRequest(request, coursePhaseID, courseParticipationID)
	err := DeveloperProfileServiceSingleton.queries.CreateDeveloperProfile(ctxWithTimeout, params)
	if err != nil {
		log.WithFields(log.Fields{
			"coursePhaseID":         coursePhaseID,
			"courseParticipationID": courseParticipationID,
			"error":                 err,
		}).Error("Failed to create developer profile")
		return errors.New("failed to create developer profile")
	}
	return nil

}
