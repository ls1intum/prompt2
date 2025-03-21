package coursePhaseDTO

import (
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/meta"
)

type PrevCoursePhaseData struct {
	PrevData    meta.MetaData           `json:"prevData"`
	Resolutions []CoursePhaseResolution `json:"resolutions"`
}

func GetPrevCoursePhaseDataDTO(prevCoreData []byte, resolutions []db.GetPrevCoursePhaseDataResolutionRow) (PrevCoursePhaseData, error) {
	prevData, err := meta.GetMetaDataDTOFromDBModel(prevCoreData)
	if err != nil {
		return PrevCoursePhaseData{}, err
	}

	resolutionDTOs := make([]CoursePhaseResolution, 0, len(resolutions))
	for _, resolution := range resolutions {
		resolutionDTOs = append(resolutionDTOs, GetResolutionDTOFromDBModel(resolution))
	}

	return PrevCoursePhaseData{
		PrevData:    prevData,
		Resolutions: resolutionDTOs,
	}, nil
}
