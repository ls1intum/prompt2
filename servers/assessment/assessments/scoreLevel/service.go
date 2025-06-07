package scoreLevel

import (
	"context"
	"fmt"

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

	return scoreLevels, nil
}

func GetScoreLevelByCourseParticipationID(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (db.ScoreLevel, error) {
	dbScoreLevel, err := ScoreLevelServiceSingleton.queries.GetScoreLevelByCourseParticipationID(ctx, db.GetScoreLevelByCourseParticipationIDParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("Error fetching score level from database: ", err)
		return db.ScoreLevelVeryBad, err
	}

	return db.ScoreLevel(dbScoreLevel), nil
}

func GetStudentScore(ctx context.Context, courseParticipationID, coursePhaseID uuid.UUID) (scoreLevelDTO.StudentScore, error) {
	studentScoreWithLevel, err := ScoreLevelServiceSingleton.queries.GetStudentScoreWithLevel(ctx, db.GetStudentScoreWithLevelParams{
		CourseParticipationID: courseParticipationID,
		CoursePhaseID:         coursePhaseID,
	})
	if err != nil {
		log.Error("Error fetching student score with level from database: ", err)
		return scoreLevelDTO.StudentScore{}, err
	}
	score, err := studentScoreWithLevel.ScoreNumeric.Float64Value()
	if err != nil {
		log.Error("Error converting score to float64: ", err)
		return scoreLevelDTO.StudentScore{}, err
	}

	mappedScoreLevel := scoreLevelDTO.MapDBScoreLevelToDTO(db.ScoreLevel(studentScoreWithLevel.ScoreLevel))
	if mappedScoreLevel == scoreLevelDTO.ScoreLevelUnknown {
		return scoreLevelDTO.StudentScore{}, fmt.Errorf("unknown score level: %s", studentScoreWithLevel.ScoreLevel)
	}

	return scoreLevelDTO.StudentScore{
		ScoreLevel: mappedScoreLevel,
		Score:      score,
	}, nil
}
