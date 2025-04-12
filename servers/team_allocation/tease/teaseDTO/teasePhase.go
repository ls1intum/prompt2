package teaseDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type TeasePhase struct {
	CoursePhaseID              uuid.UUID        `json:"id"`
	SemesterName               string           `json:"semesterName"`
	KickoffSubmissionPeriodEnd pgtype.Timestamp `json:"kickoffSubmissionPeriodEnd"`
}
