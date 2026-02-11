package template

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
)

type TemplateService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var TemplateServiceSingleton *TemplateService

func GetTemplateInfo(ctx context.Context, coursePhaseID uuid.UUID) (string, error) {
	return "This is a message provided by the template service", nil
}
