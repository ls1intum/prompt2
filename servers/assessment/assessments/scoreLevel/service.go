package scoreLevel

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/assessment/assessments/scoreLevel/scoreLevelDTO"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	log "github.com/sirupsen/logrus"
)

type ScoreLevelService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var ScoreLevelServiceSingleton *ScoreLevelService

func GetAllScoreLevels(ctx context.Context, coursePhaseID uuid.UUID) ([]scoreLevelDTO.ScoreLevelWithParticipation, error) {
	dbScoreLevels, err := ScoreLevelServiceSingleton.queries.GetAllScoreLevels(ctx, coursePhaseID)
	if err != nil {
		log.Error("Error fetching score levels from database: ", err)
		return []scoreLevelDTO.ScoreLevelWithParticipation{}, err
	}
	scoreLevels := scoreLevelDTO.GetScoreLevelsFromDBScoreLevels(dbScoreLevels)
	if len(scoreLevels) == 0 {
		log.Error("No score levels found for course phase ID: ", coursePhaseID)
		return []scoreLevelDTO.ScoreLevelWithParticipation{}, errors.New("no score levels found")
	}

	return scoreLevels, nil
}

func GetScoreLevelByCourseParticipationID(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (db.ScoreLevel, error) {
	dbScoreLevel, err := ScoreLevelServiceSingleton.queries.GetScoreLevelByCourseParticipationID(ctx, db.GetScoreLevelByCourseParticipationIDParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("Error fetching score level from database: ", err)
		return db.ScoreLevelNovice, err
	}
	scoreLevel := db.ScoreLevel(dbScoreLevel)

	return scoreLevel, nil
}
