package seatPlanDTO

import (
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
)

type Seat struct {
	SeatName        string      `json:"seat_name"`
	HasMac          bool        `json:"has_mac"`
	DeviceID        pgtype.Text `json:"device_id"`
	AssignedStudent pgtype.UUID `json:"assigned_student"` // using pgtype bc. it might be empty
	AssignedTutor   pgtype.UUID `json:"assigned_tutor"`
}

func GetSeatDTOFromDBModel(seat db.Seat) Seat {
	return Seat{
		SeatName:        seat.SeatName,
		HasMac:          seat.HasMac,
		DeviceID:        seat.DeviceID,
		AssignedStudent: seat.AssignedStudent,
		AssignedTutor:   seat.AssignedTutor,
	}
}

func GetSeatDTOsFromDBModels(seats []db.Seat) []Seat {
	seatDTOs := make([]Seat, 0, len(seats))
	for _, seat := range seats {
		seatDTOs = append(seatDTOs, GetSeatDTOFromDBModel(seat))
	}
	return seatDTOs
}
