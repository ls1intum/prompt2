package validation

import (
	"context"
	"errors"

	"github.com/google/uuid"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

func CheckAssessmentCompletionExists(ctx context.Context, qtx *db.Queries, courseParticipationID, coursePhaseID uuid.UUID) error {
	exists, err := qtx.CheckAssessmentCompletionExists(ctx, db.CheckAssessmentCompletionExistsParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("could not check assessment completion existence: ", err)
		return errors.New("could not check assessment completion existence")
	}
	if exists {
		log.Error("cannot create/update assessment, completion already exists")
		return errors.New("assessment was already marked as completed and cannot be modified")
	}
	return nil
}
