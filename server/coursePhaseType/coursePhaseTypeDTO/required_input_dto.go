package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type RequiredInputDTO struct {
	ID                uuid.UUID     `json:"id"`
	CoursePhaseTypeID uuid.UUID     `json:"coursePhaseTypeID"`
	DtoName           string        `json:"dtoName"`
	Specification     meta.MetaData `json:"specification"` // the specification follows the same structure as the meta.MetaData
}

func GetRequiredInputDTOsFromDBModel(dbModel []db.CoursePhaseTypeRequiredInputDto) ([]RequiredInputDTO, error) {
	var DTOs []RequiredInputDTO

	for _, dbModel := range dbModel {
		dto, err := GetRequiredInputDTOFromDBModel(dbModel)
		if err != nil {
			return nil, err
		}
		DTOs = append(DTOs, dto)
	}

	return DTOs, nil
}

func GetRequiredInputDTOFromDBModel(dbModel db.CoursePhaseTypeRequiredInputDto) (RequiredInputDTO, error) {
	specification, err := meta.GetMetaDataDTOFromDBModel(dbModel.Specification)
	if err != nil {
		return RequiredInputDTO{}, err
	}

	return RequiredInputDTO{
		ID:                dbModel.ID,
		CoursePhaseTypeID: dbModel.CoursePhaseTypeID,
		DtoName:           dbModel.DtoName,
		Specification:     specification,
	}, nil
}
