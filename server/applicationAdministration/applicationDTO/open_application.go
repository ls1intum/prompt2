package applicationDTO

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type OpenApplication struct {
	CourseName          string      `json:"courseName"`
	CoursePhaseID       uuid.UUID   `json:"id"`
	CourseType          string      `json:"courseType"`
	ECTS                int         `json:"ects"`
	StartDate           pgtype.Date `json:"startDate"`
	EndDate             pgtype.Date `json:"endDate"`
	ApplicationDeadline string      `json:"applicationDeadline"`
}

func GetOpenApplicationPhaseDTO(dbModel db.GetAllOpenApplicationPhasesRow) OpenApplication {
	return OpenApplication{
		CourseName:          dbModel.CourseName,
		CoursePhaseID:       dbModel.CoursePhaseID,
		CourseType:          string(dbModel.CourseType),
		ECTS:                int(dbModel.Ects.Int32),
		StartDate:           dbModel.StartDate,
		EndDate:             dbModel.EndDate,
		ApplicationDeadline: dbModel.ApplicationEndDate,
	}
}
