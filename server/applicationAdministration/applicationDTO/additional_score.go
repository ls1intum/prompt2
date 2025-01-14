package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type AdditionalScoreUpload struct {
	Name            string            `json:"name"`
	Key             string            `json:"key"`
	Threshold       pgtype.Numeric    `json:"threshold"`
	ThresholdActive bool              `json:"threshold_active"`
	Scores          []IndividualScore `json:"scores"`
}

type IndividualScore struct {
	CoursePhaseParticipationID uuid.UUID      `json:"course_phase_participation_id"`
	Score                      pgtype.Numeric `json:"score"`
}

// used to store the additional score objects in the meta data
// we do not store the Threshold as not required after adding
type AdditionalScore struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}
