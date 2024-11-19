package application

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/application/applicationDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type ApplicationServiceSingleton struct {
	queries db.Queries
	conn    *pgx.Conn
}

var ApplicationService *ApplicationServiceSingleton

// TODO
func GetApplicationForm(ctx context.Context, coursePhaseID uuid.UUID) (applicationDTO.Form, error) {
	return applicationDTO.Form{}, nil
}

// TODO
func CreateNewApplicationForm() {

}

// TODO
func UpdateApplicationForm() {

}

// TODO
func GetApplication() {

}

// TODO
func CreateApplication() {

}

// TODO
func UpdateApplication() {

}
