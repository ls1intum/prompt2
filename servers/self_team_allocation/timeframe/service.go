package timeframe

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/self_team_allocation/db/sqlc"
	"github.com/ls1intum/prompt2/servers/self_team_allocation/timeframe/timeframeDTO"
	log "github.com/sirupsen/logrus"
)

type TimeframeService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TimeframeServiceSingleton *TimeframeService

func GetTimeframe(ctx context.Context, coursePhaseID uuid.UUID) (timeframeDTO.Timeframe, error) {
	timeframe, err := TimeframeServiceSingleton.queries.GetTimeframe(ctx, coursePhaseID)
	if err != nil && errors.Is(err, sql.ErrNoRows) {
		return timeframeDTO.Timeframe{TimeframeSet: false}, nil
	} else if err != nil {
		log.Error("could not get timeframe: ", err)
		return timeframeDTO.Timeframe{}, errors.New("could not get timeframe")
	}
	return timeframeDTO.GetTimeframeDTOFromDBModel(timeframe), nil
}

func SetTimeframe(ctx context.Context, coursePhaseID uuid.UUID, startTime, endTime time.Time) error {
	if !startTime.Before(endTime) {
		return errors.New("survey start must be before survey deadline")
	}

	var startTimestamp, deadlineTimestamp pgtype.Timestamp
	startTimestamp = pgtype.Timestamp{Time: startTime, Valid: true}
	deadlineTimestamp = pgtype.Timestamp{Time: endTime, Valid: true}

	err := TimeframeServiceSingleton.queries.SetTimeframe(ctx, db.SetTimeframeParams{
		CoursePhaseID: coursePhaseID,
		Starttime:     startTimestamp,
		Endtime:       deadlineTimestamp,
	})
	if err != nil {
		log.Error("failed to set timeframe: ", err)
		return errors.New("failed to set timeframe")
	}

	return nil
}
