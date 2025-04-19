package coursePhaseDTO

import (
	"github.com/niclasheun/prompt2.0/coursePhase/resolution"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type PrevCoursePhaseData struct {
	PrevData    meta.MetaData           `json:"prevData"`
	Resolutions []resolution.Resolution `json:"resolutions"`
}

func GetPrevCoursePhaseDataDTO(prevCoreData []byte, resolutions []db.GetPrevCoursePhaseDataResolutionRow) (PrevCoursePhaseData, error) {
	prevData, err := meta.GetMetaDataDTOFromDBModel(prevCoreData)
	if err != nil {
		return PrevCoursePhaseData{}, err
	}

	resolutionDTOs := make([]resolution.Resolution, 0, len(resolutions))
	for _, resolutionDTO := range resolutions {
		resolutionDTOs = append(resolutionDTOs, resolution.GetPhaseResolutionDTOFromDBModel(resolutionDTO))
	}

	return PrevCoursePhaseData{
		PrevData:    prevData,
		Resolutions: resolutionDTOs,
	}, nil
}
