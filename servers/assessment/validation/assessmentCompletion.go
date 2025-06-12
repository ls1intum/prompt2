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
		completion, err := qtx.GetAssessmentCompletion(ctx, db.GetAssessmentCompletionParams{
			CourseParticipationID: courseParticipationID,
			CoursePhaseID:         coursePhaseID,
		})
		if err != nil {
			log.Error("could not get assessment completion: ", err)
			return errors.New("could not get assessment completion")
		}

		if completion.Completed {
			log.Error("assessment completion already exists and is marked as completed")
			return errors.New("assessment completion already exists and is marked as completed")
		}
	}
	return nil
}
