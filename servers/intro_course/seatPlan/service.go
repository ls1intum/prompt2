package seatPlan

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/seatPlan/seatPlanDTO"
	log "github.com/sirupsen/logrus"
)

type SeatPlanService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var SeatPlanServiceSingleton *SeatPlanService

func CreateSeatPlan(ctx context.Context, coursePhaseID uuid.UUID, seatNames []string) error {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	err := SeatPlanServiceSingleton.queries.CreateSeatPlan(ctxWithTimeout, db.CreateSeatPlanParams{
		CoursePhaseID: coursePhaseID,
		Seats:         seatNames,
	})
	if err != nil {
		log.WithFields(log.Fields{
			"coursePhaseID": coursePhaseID,
			"error":         err,
		}).Error("Failed to store seat plan")
		return errors.New("failed to create seat plan")
	}
	return nil
}

func GetSeatPlan(ctx context.Context, coursePhaseID uuid.UUID) ([]seatPlanDTO.Seat, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	seats, err := SeatPlanServiceSingleton.queries.GetSeatPlan(ctxWithTimeout, coursePhaseID)
	if err != nil {
		log.WithFields(log.Fields{
			"coursePhaseID": coursePhaseID,
			"error":         err,
		}).Error("Failed to get seat plan")
		return nil, errors.New("failed to get seat plan")
	}

	return seatPlanDTO.GetSeatDTOsFromDBModels(seats), nil
}

func UpdateSeatPlan(ctx context.Context, coursePhaseID uuid.UUID, seatDTOs []seatPlanDTO.Seat) error {
	tx, err := SeatPlanServiceSingleton.conn.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	qtx := SeatPlanServiceSingleton.queries.WithTx(tx)

	// validate that all seatDTOs belong to the coursePhaseID
	for _, seatDTO := range seatDTOs {
		err = qtx.UpdateSeat(ctx, db.UpdateSeatParams{
			CoursePhaseID:   coursePhaseID,
			SeatName:        seatDTO.SeatName,
			HasMac:          seatDTO.HasMac,
			DeviceID:        seatDTO.DeviceID,
			AssignedStudent: seatDTO.AssignedStudent,
			AssignedTutor:   seatDTO.AssignedTutor,
		})

		if err != nil {
			log.WithFields(log.Fields{
				"coursePhaseID": coursePhaseID,
				"seatDTO":       seatDTO,
				"error":         err,
			}).Error("Failed to update seat")
			return errors.New("failed to update seat")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		log.Error(err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
