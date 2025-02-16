package coursePhaseType

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/coursePhaseType/coursePhaseTypeDTO"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
)

type CoursePhaseTypeService struct {
	queries db.Queries
	conn    *pgxpool.Pool
}

var CoursePhaseTypeServiceSingleton *CoursePhaseTypeService

func GetAllCoursePhaseTypes(ctx context.Context) ([]coursePhaseTypeDTO.CoursePhaseType, error) {
	ctxWithTimeout, cancel := db.GetTimeoutContext(ctx)
	defer cancel()

	coursePhaseTypes, err := CoursePhaseTypeServiceSingleton.queries.GetAllCoursePhaseTypes(ctxWithTimeout)
	if err != nil {
		return nil, err
	}

	dtoCoursePhaseTypes := make([]coursePhaseTypeDTO.CoursePhaseType, 0, len(coursePhaseTypes))
	for _, phaseType := range coursePhaseTypes {
		fetchedRequiredInputDTOs, err := CoursePhaseTypeServiceSingleton.queries.GetCoursePhaseRequiredInputs(ctxWithTimeout, phaseType.ID)
		if err != nil {
			return nil, err
		}

		fetchedProvidedOutputDTOs, err := CoursePhaseTypeServiceSingleton.queries.GetCoursePhaseProvidedOutputs(ctxWithTimeout, phaseType.ID)
		if err != nil {
			return nil, err
		}

		requiredInputDTOs, err := coursePhaseTypeDTO.GetRequiredInputDTOsFromDBModel(fetchedRequiredInputDTOs)
		if err != nil {
			return nil, err
		}

		providedOutputDTOs, err := coursePhaseTypeDTO.GetProvidedOutputDTOsFromDBModel(fetchedProvidedOutputDTOs)
		if err != nil {
			return nil, err
		}

		dtoCoursePhaseType, err := coursePhaseTypeDTO.GetCoursePhaseTypeDTOFromDBModel(phaseType, requiredInputDTOs, providedOutputDTOs)
		if err != nil {
			return nil, err
		}
		dtoCoursePhaseTypes = append(dtoCoursePhaseTypes, dtoCoursePhaseType)
	}

	return dtoCoursePhaseTypes, nil
}
