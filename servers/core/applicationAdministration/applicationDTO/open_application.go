package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
)

type OpenApplication struct {
	CourseName               string      `json:"courseName"`
	CoursePhaseID            uuid.UUID   `json:"id"`
	CourseType               string      `json:"courseType"`
	ECTS                     int         `json:"ects"`
	StartDate                pgtype.Date `json:"startDate"`
	EndDate                  pgtype.Date `json:"endDate"`
	ApplicationDeadline      string      `json:"applicationDeadline"`
	ExternalStudentsAllowed  bool        `json:"externalStudentsAllowed"`
	UniversityLoginAvailable bool        `json:"universityLoginAvailable"`
}

func GetOpenApplicationPhaseDTO(dbModel db.GetAllOpenApplicationPhasesRow) OpenApplication {
	return OpenApplication{
		CourseName:               dbModel.CourseName,
		CoursePhaseID:            dbModel.CoursePhaseID,
		CourseType:               string(dbModel.CourseType),
		ECTS:                     int(dbModel.Ects.Int32),
		StartDate:                dbModel.StartDate,
		EndDate:                  dbModel.EndDate,
		ApplicationDeadline:      dbModel.ApplicationEndDate,
		ExternalStudentsAllowed:  dbModel.ExternalStudentsAllowed,
		UniversityLoginAvailable: dbModel.UniversityLoginAvailable,
	}
}
