package coursePhaseType

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/coursePhaseType/coursePhaseTypeDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseTypeService struct {
	queries db.Queries
	conn    *pgx.Conn
}

var CoursePhaseTypeServiceSingleton *CoursePhaseTypeService

func GetAllCoursePhaseTypes(ctx context.Context) ([]coursePhaseTypeDTO.CoursePhaseType, error) {
	coursePhaseTypes, err := CoursePhaseTypeServiceSingleton.queries.GetAllCoursePhaseTypes(ctx)
	if err != nil {
		return nil, err
	}

	dtoCoursePhaseTypes := make([]coursePhaseTypeDTO.CoursePhaseType, 0, len(coursePhaseTypes))
	for _, phaseType := range coursePhaseTypes {
		dtoType, err := coursePhaseTypeDTO.GetCoursePhaseTypeDTOFromDBModel(phaseType)
		if err != nil {
			return nil, err
		}
		dtoCoursePhaseTypes = append(dtoCoursePhaseTypes, dtoType)
	}

	return dtoCoursePhaseTypes, nil
}
