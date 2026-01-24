package copy

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
)

type CopyService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

func NewCopyService(queries db.Queries, conn *pgxpool.Pool) *CopyService {
	return &CopyService{
		queries: queries,
		conn:    conn,
	}
}

func (s *CopyService) CopyData(ctx context.Context, sourceCoursePhaseID, targetCoursePhaseID uuid.UUID) error {
	// Placeholder - copying not yet implemented
	// Will copy interview slots from source to target phase
	return nil
}
