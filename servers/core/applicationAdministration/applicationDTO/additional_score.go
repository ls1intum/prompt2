package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type AdditionalScoreUpload struct {
	Name            string            `json:"name"`
	Key             string            `json:"key"`
	Threshold       pgtype.Numeric    `json:"threshold" swaggertype:"number,format=double"`
	ThresholdActive bool              `json:"thresholdActive"`
	Scores          []IndividualScore `json:"scores"`
}

type IndividualScore struct {
	CourseParticipationID uuid.UUID      `json:"courseParticipationID"`
	Score                 pgtype.Numeric `json:"score" swaggertype:"number,format=double"`
}

// used to store the additional score objects in the meta data
// we do not store the Threshold as not required after adding
type AdditionalScore struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}
