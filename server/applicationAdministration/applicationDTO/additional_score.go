package applicationDTO

import "github.com/jackc/pgx/v5/pgtype"

type AdditionalScore struct {
	Name            string            `json:"name"`
	Threshold       pgtype.Numeric    `json:"threshold"`
	ThresholdActive bool              `json:"threshold_active"`
	Scores          []IndividualScore `json:"scores"`
}

type IndividualScore struct {
	CoursePhaseParticipationID string         `json:"course_phase_participation_id"`
	Score                      pgtype.Numeric `json:"score"`
}
