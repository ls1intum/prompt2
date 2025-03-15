package coursePhaseTypeDTO

import (
	"github.com/google/uuid"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
	log "github.com/sirupsen/logrus"
)

type ProvidedOutputDTO struct {
	ID                uuid.UUID     `json:"id"`
	CoursePhaseTypeID uuid.UUID     `json:"coursePhaseTypeID"`
	DtoName           string        `json:"dtoName"`
	Specification     meta.MetaData `json:"specification"` // the specification follows the same structure as the meta.MetaData
	VersionNumber     int32         `json:"versionNumber"`
	EndpointPath      string        `json:"endpointPath"`
}

func GetProvidedOutputDTOsFromDBModel(dbModel []db.CoursePhaseTypeParticipationProvidedOutputDto) ([]ProvidedOutputDTO, error) {
	var DTOs []ProvidedOutputDTO

	for _, dbModel := range dbModel {
		dto, err := GetProvidedOutputDTOFromDBModel(dbModel)
		if err != nil {
			log.Error("Failed to get ProvidedOutputDTO from DB model")
			return nil, err
		}
		DTOs = append(DTOs, dto)
	}

	return DTOs, nil
}

func GetProvidedOutputDTOFromDBModel(dbModel db.CoursePhaseTypeParticipationProvidedOutputDto) (ProvidedOutputDTO, error) {
	specification, err := meta.GetMetaDataDTOFromDBModel(dbModel.Specification)
	if err != nil {
		return ProvidedOutputDTO{}, err
	}

	return ProvidedOutputDTO{
		ID:                dbModel.ID,
		CoursePhaseTypeID: dbModel.CoursePhaseTypeID,
		DtoName:           dbModel.DtoName,
		Specification:     specification,
		VersionNumber:     dbModel.VersionNumber,
		EndpointPath:      dbModel.EndpointPath,
	}, nil
}
